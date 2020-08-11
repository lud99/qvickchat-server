const Chat = require("../modules/ChatSchema");
const ChatApi = require("../api/chats");

const Response = require("../utils/Response");

module.exports.create = async (req, res) => {
    try {
        const name = req.body.name;
        const googleId = req.session.googleId;

        const chat = await ChatApi.create({ googleId, name });
        
        res.json({ success: true, data: chat });   
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}

module.exports.getAll = async (req, res) => {
    try {
        const count = parseInt(req.query.count);

        const chats = await ChatApi.getAll({ count });

        res.json({ success: true, data: chats });
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}

module.exports.getOne = async (req, res) => {
    try {
        const name = req.params.name;
        const count = parseInt(req.query.count);

        const chat = await ChatApi.getOne({ count, name });

        res.json({ success: true, data: chat });
    } catch (error) {
        console.error(error);

        return Response.sendError(res, error);
    }
}