const mongoose = require('mongoose');

const clientWhiteListSchema = mongoose.Schema(
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

const ClientWhite = mongoose.model('clientWhite', clientWhiteListSchema);

module.exports = ClientWhite;