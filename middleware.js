const jwt = require('jsonwebtoken');
const config = process.env;

const ClientBlack = require('./models/clientBlack');
const {comparetwoArray} = require('./shared');
const User = require('./models/userModel');
const { USER_STATUS } = require('./consts');

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["token"];
    if(!token) {
        return res.status(401).json({message:"A token is required for authentication"});
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({message:"Invalid Token"});
    }
    let user = await User.findOne({username: req.user.username});
    if(user && user.status && (user.status === USER_STATUS.INACTIVE)) {
        return res.status(401).json({message: "User access revoked, contact admin"});
    }
    user = await ClientBlack.findOne({token: token});
    if(user) {
        return res.status(401).json({message: "User session expired"});
    }
    cleanUp();
    return next();
}

cleanUp = async () => {
    const data = await ClientBlack.find({});
    const filteredData = [];
    data.forEach((user) => {
        const diff = dateDiff(user.createdAt, new Date());
        if(diff < 2) {
            filteredData.push(user);
        }        
    });
    if(!comparetwoArray(data, filteredData)) {
        ClientBlack.collection.drop();
        await ClientBlack.insertMany(filteredData);
    }
}

function dateDiff(a, b) {
    const date = Math.abs((a).getTime() - (b).getTime()) / 1000;  
    return Math.floor(date/(60*60));
}


module.exports = verifyToken;