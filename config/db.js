const mongoose = require("mongoose");

exports.connectDB = async () => {
    try {        
        // Try to connect
        const conn = await mongoose.createConnection(process.env.MONGO_URI_QVICKCHAT, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true
        });

        global.connections.cosmonic = conn;

        console.log(`MongoDB connected: ${conn.host}`);
    } catch (error) {
        console.error(error)
    }
}