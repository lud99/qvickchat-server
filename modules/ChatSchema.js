const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Please specify a name"]
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please specify who created this chat"]
    },
    connectedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = connections.cosmonic.model("Chat", ChatSchema);