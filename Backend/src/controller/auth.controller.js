const { registerUserService, loginUserService , forgetPasswordService } = require('../services/auth.service');

async function registerUser(req, res) {
    const { name, email, password, role } = req.body;

    const user = await registerUserService({
        name,
        email,
        password,
        role,
    });

    if (user.statusCode !== 201) {
        return res.status(user.statusCode).json(user.message)
    }

    res.cookie('JWT_Token', user.token);

    return res.status(201).json({user: user.data, token: user.token, message: user.message})
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await loginUserService({
        email,
        password,
    });

    if (user.statusCode !== 200) {
        return res.status(user.statusCode).json(user.message);
    }

    res.cookie('JWT_Token', user.token);

    return res.status(200).json({ user: user.data, token: user.token, message: user.message });
}

async function forgetPassword(req , res){
    const { email } = req.body;
    const user = await forgetPasswordService({
        email,
    });

    if (user.statusCode !== 200) {
        return res.status(user.statusCode).json(user.message);
    }

    return res.status(200).json({ message: user.message });
}

module.exports = { registerUser, loginUser , forgetPassword };