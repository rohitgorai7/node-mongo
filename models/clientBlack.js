const mongoose = require('mongoose');

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
        }
    },
    {
        timestamps: true
    }
)

const ClientBlack = mongoose.model('clientBlack', clientBlackListSchema);

module.exports = ClientBlack;