const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const cors = require("cors");

const { connectDB } = require("./config/db");

// Load env
dotenv.config({ path: __dirname + "/config/config.env" });
dotenv.config({ path: __dirname + "/config/secrets.env" });

const clientOrigin = process.env.NODE_ENV === "development" ? process.env.DEV_URL : process.env.PROD_URL;

const app = express();

// Cors
app.use(cors({ credentials: true, origin: clientOrigin }));

// Morgan (Logging)
app.use(morgan('[Cosmonic] :method :url :status :res[content-length] :response-time ms :date[web]'));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set up global connections variable
if (!global.connections) global.connections = {};

// Setup the websocket log level
global.WebSocketLogLevels = {
    None: 0,
    Minimal: 1,
    Full: 2
}

global.webSocketLogLevel = process.env.WEBSOCKET_LOG_LEVEL || WebSocketLogLevels.Minimal;

module.exports = () => {
    const module = {};

    const port = process.env.app_port || process.env.PORT || 3500;

    // Connect to the database, then start http and WebSocket server
    module.startServer = async (server, path = "/") => {
        // Connect to database here
        await connectDB();

         // Authorization utils (requires connecting to the database first)
        app.use(require("./utils/authorization").session);

        // Set up routes after connecting to the database
        app.use("/auth", require("./routes/auth"));

        app.use("/api/v1/users", require("./routes/users"));
        app.use("/api/v1/chats", require("./routes/chats"));
        app.use("/api/v1/chats/messages", require("./routes/messages"));

        //app.listen(port, () => console.log(`Server running in ${process.env.node_ENV} mode on port ${port}`));

        const WebSocketServer = require('./network/WebSocketServer');
        
        // Set up http routes here

        // Create and start the server manually if none is specified
        if (!server) {
            server = http.createServer(app);

            server.listen(port, () => console.log("Http server running on port %s", port));
        }

        // Start websocket server
        WebSocketServer(server, path);
    }

    module.app = app;

    return module;
}