const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        participants: {
            type: Object
        },
        lastMessage: {
            type: Object
        },
        messages: [
            {
                seenAt: {
                    type: String,
                    default: ''
                },
                message: {
                    type: String || Object
                },
                messageType: {
                    type: String
                },
                sender: {
                    type: String
                },
                receiver: {
                    type: String
                },
                createdAt: {
                    type: String,
                    default: new Date(Date.now())
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model('messages', chatSchema);

module.exports = Chat;