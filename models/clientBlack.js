const mongoose = require('mongoose');
const { USER_STATUS } = require('../consts');

const clientBlackListSchema = mongoose.Schema(
    {
        email: { 
            type: String
        },    
        username: {
            type: String
        },
        token: {
            type: String,
            unique: true
        },
        userId: {
            type: String
        },
        status: {
            type: String,
            default: USER_STATUS.ACTIVE
        },
        isLoggedIn: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

const ClientBlack = mongoose.model('clientBlack', clientBlackListSchema);

module.exports = ClientBlack;