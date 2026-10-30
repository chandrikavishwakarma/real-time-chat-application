require("dotenv").config();

const app = require("./src/app.js");
const { dbConnect } = require("./src/config/db.js");
const { Server } = require("socket.io");
const http = require("http");
const chatSocket = require("./src/socket/chatSocket.js");
const redisClient = require("./src/config/redis.js")
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

chatSocket(io);

const startServer = async () => {
  try {
    await dbConnect();
    await redisClient.connect();
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
