const Chat = require("../../modules/ChatSchema");
const { UserUtils } = require("../../utils/ApiUtils");

const Get = require("./get");

const RouteError = require("../../utils/RouteError");

module.exports.add = async ({ userId, googleId, name }) => {
    try {   
        if (!name) throw new RouteError("No name specified", 400);

        // Get the user id from a google id
        var user;
        if (!userId) {
            user = await UserUtils.getByGoogleId(googleId);
            userId = user._id;
        } 

        if (!user.hasCompletedSignUp)
            throw new RouteError("You are not registered", 403);

        var chat = await Chat.findOne({ name });
    
        if (!chat) throw new RouteError("Invalid chat name specified", 400);

        const users = chat.connectedUsers;

        // Don't add duplicate users
        if (!users.includes(userId))
            users.push(userId);

        await chat.save();

        return await Get.one({ name });
        
    } catch (error) {
        // Invalid data specified
        if (error.name === "ValidationError")
            throw new RouteError(error.errors.name.message, 400);

        // Throw the error 'upwards' so that where this was called from can handle it
        throw error;
    }
}

module.exports.remove = async ({ userId, googleId, name }) => {
    try {   
        if (!name) throw new RouteError("No name specified", 400);

        // Get the user id from a google id
        var user;
        if (!userId) {
            user = await UserUtils.getByGoogleId(googleId);
            userId = user._id;
        } 

        if (!user.hasCompletedSignUp)
            throw new RouteError("You are not registered", 403);

        const chat = await Chat.findOne({ name });
        const users = chat.connectedUsers;

        // Only remove the user if it exists
        if (users.includes(userId))
            users.splice(users.indexOf(userId), 1);

        return await chat.save();
        
    } catch (error) {
        // Invalid data specified
        if (error.name === "ValidationError")
            throw new RouteError(error.errors.name.message, 400);

        // Throw the error 'upwards' so that where this was called from can handle it
        throw error;
    }
}