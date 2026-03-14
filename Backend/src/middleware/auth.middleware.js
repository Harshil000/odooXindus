const jwt = require('jsonwebtoken');

async function identifyUser(req , res , next) {
    const token = req.cookies.jwt_token;
    if (!token) {
        return res.status(401).json({msg : 'No Token , authorization denied'})
    }

    let decoded = null

    try {
        decoded = jwt.verify(token , process.env.JWT_SECRET_KEY)
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({msg : 'Token is not valid'})
    }
}

module.exports = identifyUser;