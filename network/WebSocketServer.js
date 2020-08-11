const WebSocketServer = require("ws").Server;

const ChatApi = require("../api/chats");
const MessageApi = require("../api/messages");

const Client = require("./Client");

const Utils = require("../utils/Utils");
const { getSession } = require("../utils/authorization");
const { UserUtils } = require("../utils/ApiUtils");

const pingTime = process.env.WEBSOCKET_PING_TIME || 30000;

const logPingMessages = process.env.WEBSOCKET_LOG_PINGPONG_MESSAGES == "true" || false;

let ws;

var sessions = new Map();

const start = (server, path) => {
    ws = new WebSocketServer({ server, path });

    console.log("[Qvickchat] Websocket server running on path '%s'", path)

    ws.on("connection", onConnection);
}

const onConnection = (conn) => {
    // Create client
    const client = new Client(conn, Utils.createId());

    if (webSocketLogLevel >= WebSocketLogLevels.Minimal)
        console.log("[Qvickchat] Client '%s' connected", client.id);

    // Remove the client from any sessions
    conn.on("close", () => disconnectClient(client));

    // Handle messages
    conn.on("message", message => handleMessage(client, JSON.parse(message)));

    // Setup ping pong
    client.pingPongTimer = setInterval(() => pingPong(client), pingTime);
}

const handleMessage = async (client, message) => {
    try {
        console.log(`[Qvickchat] Received WebSocket message of type '${message.type}'`);

        switch (message.type) {
            // Sessions
            case "join-session": {
                const authSession = await getSession(message.authorization);
                if (!authSession) return client.sendErrorResponse("Invalid authorization provided", message);

                client.authorization = message.authorization;

                const chatName = message.data.chatName;

                client.joinSession(sessions, chatName);

                const chat = await ChatApi.addConnectedUser({ name: chatName, googleId: authSession.googleId });

                const response = { chat }

                client.sendResponse(response, message, client.SendType.Single);

                const user = await getUser(authSession.googleId);

                broadcastSession(client.session, user);

                break;
            } 

            case "new-chat": {
                const authSession = await getSession(message.authorization);
                if (!authSession) return client.sendErrorResponse("Invalid authorization provided", message);

                const name = message.data.name;

                const chat = await ChatApi.create({ name, googleId: authSession.googleId });

                const response = { chat }

                client.sendResponse(response, message, client.SendType.Single);

                break;
            } 

            case "new-message": {
                const authSession = await getSession(message.authorization);
                if (!authSession) return client.sendErrorResponse("Invalid authorization provided", message);

                const { text, chatName } = message.data;

                const createdMessage = await MessageApi.create({ text, chatName, googleId: authSession.googleId });

                const response = { message: createdMessage }

                client.sendResponse(response, message, client.SendType.Broadcast);
            } 

            // Ping Pong
            case "pong": {
                client.isAlive = true; // The client is still connected

                if (logPingMessages) console.log("[Qvickchat] Received pong from client '%s'", client.id);
                
                break;
            }

            default: {
                console.log("[Qvickchat] Other message:", message);

                break;
            }
        }
    } catch (error) {
        console.error(error, message);

        client.sendErrorResponse(error.message || error, message, error.status);
    }
}

const pingPong = (client) => {
    // Terminate the connection with the client if it isn't alive
    if (!client.isAlive) return client.terminate();

    // Default the client to being disconnected, but if a pong message is received from them they are considered still alive
    client.isAlive = false;

    if (logPingMessages) console.log("[Qvickchat] Sending ping to client '%s'", client.id);

    client.ping();
}

const disconnectClient = async (client) => {
    const session = client.session;

    const authSession = await getSession(client.authorization);

    if (authSession)
        await ChatApi.removeConnectedUser({ 
            name: session.id, 
            googleId: authSession.googleId 
        });
            
    // If the client is in a session
    if (session) {
        session.leave(client); // Remove the client from the session

        if (webSocketLogLevel >= WebSocketLogLevels.Minimal)
            console.log("[Qvickchat] Client '%s' disconnected, %s clients remaining in session '%s'", client.id, session.clients.size, session.id);

        // Remove the session if it's empty
        if (session.clients.size == 0) {
            sessions.delete(session.id);

            if (webSocketLogLevel >= WebSocketLogLevels.Minimal)
                console.log("[Qvickchat] Removing empty session '%s'", session.id);
        }
    } else {
        if (webSocketLogLevel >= WebSocketLogLevels.Minimal)
            console.log("[Qvickchat] Client '%s' disconnected", client.id);
    }

    // Remove the ping pong
    clearInterval(client.pingPongTimer);

    // Terminate the connection
    client.terminate();
}

const broadcastSession = async (session, me) => {
    const chat = await ChatApi.getOne({ name: session.id })

    const broadcast = {
        type: "session-broadcast",
        data: {
            name: session.id,
            me: me,
            users: chat.connectedUsers
        }
    };

    session.broadcast(broadcast);
}

const getUser = async (googleId) => UserUtils.removeSensitiveData(await UserUtils.getByGoogleId(googleId));

module.exports = start;