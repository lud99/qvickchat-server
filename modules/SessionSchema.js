const mongoose = require("mongoose");
const ttl = require('mongoose-ttl');

const SessionSchema = mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: [true, "Please specify a session id"],
    },
    googleId: {
        type: String,
        required: [true, "Please specify a google user beloning to this session"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expireAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically remove the session from the database after it has expired
SessionSchema.plugin(ttl, { ttl: process.env.SESSION_AGE_MS });

module.exports = connections.cosmonic.model("Session", SessionSchema);