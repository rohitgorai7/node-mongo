const jwt = require('jsonwebtoken');
const config = process.env;

const ClientBlack = require('./models/clientBlack');
const {comparetwoArray} = require('./shared');

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.headers["token"];
    if(!token) {
        return res.status(403).json({message:"A token is required for authentication"});
    }
    const user = await ClientBlack.findOne({token: token});
    if(user) {
        return res.status(401).json({message: "User session expired"});
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({message:"Invalid Token"});
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
        console.log('sdads')
        ClientBlack.collection.drop();
        await ClientBlack.insertMany(filteredData);
    }
}

function dateDiff(a, b) {
    const date = Math.abs((a).getTime() - (b).getTime()) / 1000;  
    return Math.floor(date/(60*60));
}


module.exports = verifyToken;