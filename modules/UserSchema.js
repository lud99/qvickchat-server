const mongoose = require("mongoose");
require('mongoose-type-email');

const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please specify a first name"]
    },
    surname: {
        type: String,
    },
    fullName: {
        type: String,
        required: [true, "Please specify a full name"]
    },
    username: {
        type: String,
        unique: true,
    },
    local: {
        type: String,
        default: "sv"
    },
    image: {
        type: String
    },
    googleId: {
        type: String,
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        allowBlank: true,
    },
    hasCompletedSignUp: {
        type: Boolean,
        default: false
    },
    ipAdress: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = connections.cosmonic.model("User", UserSchema);