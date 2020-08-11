const Session = require("../modules/SessionSchema");
const User = require("../modules/UserSchema");

const RouteError = require("./RouteError");

const uuidv4 = require("uuid").v4;

class SessionUtils {
    static async createSession(googleId) {
        const session = await Session.create({ sessionId: uuidv4(), googleId });

        return session;
    }

    static async getSession(sessionId) {
        return await Session.findOne({ sessionId });
    }
}

class UserUtils {
    static async getByGoogleId(googleId) {
        const user = await User.findOne({ googleId: googleId });

        if (!user) throw new RouteError("No user with that google id could be found", 400);

        return user;
    }

    static removeSensitiveData({ username, image, _id, createdAt }) {
        return { username, image, _id, createdAt };
    }
}

module.exports.SessionUtils = SessionUtils;
module.exports.UserUtils = UserUtils;