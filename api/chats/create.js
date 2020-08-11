const Chat = require("../../modules/ChatSchema");
const { UserUtils } = require("../../utils/ApiUtils");

const RouteError = require("../../utils/RouteError");

module.exports = async ({ userId, googleId, name }) => {
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

        var chat = await Chat.create({ name, createdBy: userId });

        // Remove sensitive user data
        chat = await Chat.populate(chat, "createdBy");
        chat = JSON.parse(JSON.stringify(chat));
        chat.createdBy = UserUtils.removeSensitiveData(chat.createdBy);

        return chat;
        
    } catch (error) {
        // Invalid data specified
        if (error.name === "ValidationError")
            throw new RouteError(error.errors.name.message, 400);

        // Duplicate key error
        if (error.keyValue && error.keyValue.name && error.code === 11000)
            throw new RouteError("A chat with this name already exists. Please choose another name", 400); 

        // Throw the error 'upwards' so that where this was called from can handle it
        throw error;
    }
}