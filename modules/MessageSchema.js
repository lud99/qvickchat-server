const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
    text: {
        type: String,
        required: [true, "Please specify text"]
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = connections.cosmonic.model("Message", MessageSchema);