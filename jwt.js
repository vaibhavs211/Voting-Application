const jwt = require('jsonwebtoken')

const jwtAuthMiddleware = (req, res, next) => {

    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({error: 'Invalid Token'})

    // extract jwt token from req headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({error: 'Unauthorized'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Attach user info to req object
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({error: 'Invalid Token'});
    }
}

// Funct to generate token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_KEY, {expiresIn:30000});
}

module.exports = {jwtAuthMiddleware,generateToken};