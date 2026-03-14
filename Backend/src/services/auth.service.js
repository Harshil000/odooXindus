const { randomUUID } = require('crypto');
const {
    findUserByEmail,
    createUser,
    findLoginUserByEmail,
} = require('../repositories/user.repository');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

module.exports = {
    registerUserService,
    loginUserService,
};
