const jwt = require('jsonwebtoken');
const config = process.env;

const ClientBlack = require('./models/clientBlack');

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if(!token) {
        return res.status(403).json({message:"A token is required for authentication"});
    }
    const user = await ClientBlack.findOne({token: token});
    if(user) {
        return res.status(400).json({message: "User session expired"});
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({message:"Invalid Token"});
    }
    return next();
}

module.exports = verifyToken;