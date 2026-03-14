const { randomUUID } = require('crypto');
const {
    findUserByEmail,
    createUser,
    findLoginUserByEmail,
    findUserById,
    updateUserProfile,
} = require('../repositories/user.repository');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");

const OTP_EXPIRY_MS = 2 * 60 * 1000;

// In-memory OTP store: { email -> { otp, expiresAt } }
const otpStore = new Map();

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function saveOtp(email, otp) {
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + OTP_EXPIRY_MS,
    });
}

function verifyStoredOtp(email, otp, { consume } = { consume: true }) {
    const record = otpStore.get(email);
    if (!record) return { valid: false, reason: 'no OTP found for this email' };
    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return { valid: false, reason: 'OTP expired' };
    }
    if (record.otp !== String(otp)) return { valid: false, reason: 'invalid OTP' };
    if (consume) otpStore.delete(email);
    return { valid: true };
}

async function registerUserService({ name, email, password, role }) {

    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
        return { statusCode: 409, message: 'email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await createUser({
        userId: randomUUID(),
        name: cleanName,
        email: normalizedEmail,
        password: hashedPassword,
        role,
    });

    const token = jwt.sign(
        {
            id: createdUser.user_id,
            email: createdUser.email,
            name: createdUser.name,
            role: createdUser.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
    );

    return { statusCode: 201, message: 'user created successfully', data: createdUser, token };
}

async function loginUserService({ email, password }) {

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findLoginUserByEmail(normalizedEmail);
    if (!existingUser) {
        return { statusCode: 401, message: 'invalid credentials' };
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
        return { statusCode: 401, message: 'invalid credentials' };
    }

    const token = jwt.sign(
        {
            id: existingUser.user_id,
            email: existingUser.email,
            name: existingUser.name,
            role: existingUser.role,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
    );

    const userData = {
        user_id: existingUser.user_id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        created_at: existingUser.created_at,
    };

    return {
        statusCode: 200,
        message: 'login successful',
        data: userData,
        token,
    };
}

async function forgetPasswordService({ email }) {
    if (typeof email !== 'string' || !email.trim()) {
        return { statusCode: 400, message: 'email is required' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (!existingUser) {
        return { statusCode: 404, message: 'user not found' };
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return { statusCode: 500, message: 'SMTP credentials are not configured' };
    }

    const otp = generateOtp();

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
          from: process.env.MAIL_FROM || process.env.SMTP_USER,
          to: normalizedEmail,
          subject: "Password Reset OTP",
          text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
          html: `<p>Your OTP is <b>${otp}</b>. It will expire in 2 minutes.</p>`,
        });

        saveOtp(normalizedEmail, otp);

        return {
            statusCode: 200,
            message: 'OTP sent successfully',
        };
    } catch (error) {
        return {
            statusCode: 500,
            message: error.message || 'failed to send email',
        };
    }
}

async function verifyOtpService({ email, otp }) {
    if (!email || !otp) {
        return { statusCode: 400, message: 'email and otp are required' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = verifyStoredOtp(normalizedEmail, otp, { consume: false });

    if (!result.valid) {
        return { statusCode: 400, message: result.reason };
    }

    return { statusCode: 200, message: 'OTP verified successfully' };
}

async function resetPasswordService({ email, otp, newPassword }) {
    if (!email || !otp || !newPassword) {
        return { statusCode: 400, message: 'email, otp and newPassword are required' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = verifyStoredOtp(normalizedEmail, otp);
    if (!result.valid) {
        return { statusCode: 400, message: result.reason };
    }

    const existingUser = await findLoginUserByEmail(normalizedEmail);
    if (!existingUser) {
        return { statusCode: 404, message: 'user not found' };
    }

    const { updateUserPassword } = require('../repositories/user.repository');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(existingUser.user_id, hashedPassword);

    return { statusCode: 200, message: 'password reset successfully' };
}

async function getMeService({ userId }) {
    if (!userId) {
        return { statusCode: 401, message: 'unauthorized' };
    }

    const user = await findUserById(userId);
    if (!user) {
        return { statusCode: 401, message: 'user not found' };
    }

    return { statusCode: 200, data: user };
}

async function updateMeService({ userId, name, email, role, newPassword }) {
    if (!userId) {
        return { statusCode: 401, message: 'unauthorized' };
    }

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanRole = (role || '').trim();
    const allowedRoles = ['Staff Member', 'Inventory Manager'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || !cleanEmail || !cleanRole) {
        return { statusCode: 400, message: 'name, email and role are required' };
    }

    if (cleanName.length < 2 || cleanName.length > 100) {
        return { statusCode: 400, message: 'name must be between 2 and 100 characters' };
    }

    if (!emailRegex.test(cleanEmail)) {
        return { statusCode: 400, message: 'please enter a valid email address' };
    }

    if (!allowedRoles.includes(cleanRole)) {
        return { statusCode: 400, message: 'invalid role selected' };
    }

    const existing = await findUserByEmail(cleanEmail);
    if (existing && existing.user_id !== userId) {
        return { statusCode: 409, message: 'email already exists' };
    }

    let hashedPassword = null;
    if (newPassword && String(newPassword).trim()) {
        const pwd = String(newPassword);
        if (pwd.length < 6 || pwd.length > 128) {
            return { statusCode: 400, message: 'new password must be between 6 and 128 characters' };
        }
        if (!/[A-Za-z]/.test(pwd) || !/\d/.test(pwd)) {
            return { statusCode: 400, message: 'new password must contain at least one letter and one number' };
        }
        hashedPassword = await bcrypt.hash(pwd, 10);
    }

    const updated = await updateUserProfile({
        userId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        password: hashedPassword,
    });

    if (!updated) {
        return { statusCode: 404, message: 'user not found' };
    }

    return { statusCode: 200, message: 'profile updated successfully', data: updated };
}

module.exports = {
    registerUserService,
    loginUserService,
    forgetPasswordService,
    verifyOtpService,
    resetPasswordService,
    getMeService,
    updateMeService,
};
