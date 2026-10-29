const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db.js");
const { invalidateConversationCache } = require("../service/messageCache.js");
function chatSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = Number(decoded.id || decoded.userId || decoded._id);

      if (!Number.isSafeInteger(userId) || userId <= 0) {
        return next(new Error("Invalid token"));
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = String(user.id);
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const myRoom = `user:${socket.userId}`;
    socket.join(myRoom);

    socket.on("send_message", async (data, callback) => {
      const reply = typeof callback === "function" ? callback : () => {};

      try {
        const receiverId = Number(data?.receiverId);
        const text = data?.text?.trim();

        if (
          !Number.isSafeInteger(receiverId) ||
          receiverId <= 0 ||
          String(receiverId) === socket.userId
        ) {
          return reply({
            success: false,
            message: "Invalid receiver",
          });
        }

        if (!text || text.length > 5000) {
          return reply({
            success: false,
            message: "Message must be 1–5000 characters",
          });
        }

        const receiver = await prisma.user.findUnique({
          where: { id: receiverId },
          select: { id: true },
        });

        if (!receiver) {
          return reply({
            success: false,
            message: "Receiver not found",
          });
        }

        // 1. Save the message in PostgreSQL
        const message = await prisma.message.create({
          data: {
            senderId: Number(socket.userId),
            receiverId: receiver.id,
            text,
          },
        });

        // 2. Invalidate the conversation's Redis cache
        await invalidateConversationCache(Number(socket.userId), receiver.id);

        // 3. Prepare the message for Socket.IO clients
        const payload = {
          _id: String(message.id),
          sender: String(message.senderId),
          receiver: String(message.receiverId),
          text: message.text,
          createdAt: message.createdAt,
        };

        // 4. Deliver to both users
        io.to(`user:${socket.userId}`)
          .to(`user:${String(receiver.id)}`)
          .emit("new_message", payload);

        // 5. Confirm successful sending
        reply({ success: true, message: payload });
      } catch (error) {
        console.error("Socket message error:", error);

        reply({
          success: false,
          message: "Unable to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Chat user disconnected:", socket.userId);
    });
  });
}

module.exports = chatSocket;
