const Chat = require("../../modules/ChatSchema");
const { UserUtils } = require("../../utils/ApiUtils");

const RouteError = require("../../utils/RouteError");

module.exports.all = async ({ count }) => {
    try {
        var chats = await Chat.find()
            .populate("createdBy connectedUsers")
            .populate({ 
                path: "messages", 
                populate: { 
                    path: "createdBy", 
                    model: "User" 
                }
            }).limit(count);

        chats = JSON.parse(JSON.stringify(chats));

        for (let i = 0; i < chats.length; i++) {
            chats[i].createdBy = UserUtils.removeSensitiveData(chats[i].createdBy);
            for (let j = 0; j < chats[i].messages.length; j++)
                chats[i].messages[j].createdBy = UserUtils.removeSensitiveData(chats[i].messages[j].createdBy);
        }

        return chats;

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
};

module.exports.one = async ({ name, count }) => {
    try {
        var chat = await Chat.findOne({ name })
            .populate("createdBy connectedUsers")
            .populate({ 
                path: "messages", 
                populate: { 
                    path: "createdBy", 
                    model: "User" 
                }
            }).limit(count);

        // Remove the mongoose reference (somehow?)
        chat = JSON.parse(JSON.stringify(chat));
        
        // Remove sensitive user data
        chat.createdBy = UserUtils.removeSensitiveData(chat.createdBy);
        for (let i = 0; i < chat.messages.length; i++)
            chat.messages[i].createdBy = UserUtils.removeSensitiveData(chat.messages[i].createdBy);
        for (let i = 0; i < chat.connectedUsers.length; i++)
            chat.connectedUsers[i] = UserUtils.removeSensitiveData(chat.connectedUsers[i]);

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
};