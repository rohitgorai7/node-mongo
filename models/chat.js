const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
    {
        participants: {
            type: Object
        },
        messages: [
            {
                seenAt: {
                    type: String
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
                    default: new Date()
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