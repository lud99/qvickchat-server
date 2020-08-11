const Message = require("../../modules/MessageSchema");
const Chat = require("../../modules/ChatSchema");
const { UserUtils } = require("../../utils/ApiUtils");

const RouteError = require("../../utils/RouteError");

module.exports = async ({ userId, googleId, chatName, text }) => {
    try {   
        if (!text) throw new RouteError("No text specified", 400);
        if (!chatName) throw new RouteError("No chat name specified", 400);

        // Get the user id from a google id
        var user;
        if (!userId) {
            user = await UserUtils.getByGoogleId(googleId);
            userId = user._id;
        } 

        if (!user.hasCompletedSignUp)
            throw new RouteError("You are not registered", 403);

        const chat = await Chat.findOne({ name: chatName });

        var message = await Message.create({ text, chat: chat._id, createdBy: userId });

        // Add the message to the chat's message array
        chat.messages.push(message._id);
        await chat.save();

        // Remove sensitive user data
        message = await Message.populate(message, "createdBy chat");
        message = JSON.parse(JSON.stringify(message));
        message.createdBy = UserUtils.removeSensitiveData(message.createdBy);

        return message;
        
    } catch (error) {
        // Invalid data specified
        if (error.name === "ValidationError")
            throw new RouteError(error.errors.name.message, 400);

        // Throw the error 'upwards' so that where this was called from can handle it
        throw error;
    }
}