const mongoose = require('mongoose');
const { USER_STATUS } = require('../consts');

const usersSchema = mongoose.Schema(
    {        
        name: {
            type: String,
            required: [true, "Please enter a proper name"]
        },    
        password: {
            type: String,
            required: [true, "Please enter a proper password"]
        },    
        email: { 
            type: String,
            required: [true, "Please enter a proper email"],
            unique: true
        },    
        username: {
            type: String,
            required: [true, "Please enter a proper username"],
            unique: true
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

const User = mongoose.model('Users', usersSchema);

module.exports = User;