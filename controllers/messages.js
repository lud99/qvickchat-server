const Message = require("../modules/MessageSchema");
const Chat = require("../modules/ChatSchema");
const MessageApi = require("../api/messages");
const { UserUtils } = require("../utils/ApiUtils");

const Response = require("../utils/Response");
const RouteError = require("../utils/RouteError");

module.exports.create = async (req, res) => {
    try {
        const text = req.body.text;
        const chatName = req.body.chatName;
        const googleId = req.session.googleId;

        const message = await MessageApi.create({ googleId, text, chatName });
        
        res.json({ success: true, data: message });   
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}

module.exports.get = async (req, res) => {
    try {
        const chatName = req.body.chatName;

        const chat = await Chat.findOne({ name: chatName });

        if (!chat) throw new RouteError("Invalid chat name specified", 400);

        const count = parseInt(req.query.count);
        const include = req.query.include || "createdBy";

        const toPopulate = include.replace(/ /g, "").replace(/,/g, " ");

        var messages = await Message.find({ chat: chat._id }).populate(toPopulate).limit(count);

        messages = JSON.parse(JSON.stringify(messages));

        for (let i = 0; i < messages.length; i++) {
            const user = messages[i].createdBy;
            if (user) 
                messages[i].createdBy = UserUtils.removeSensitiveData(user);
        }

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}