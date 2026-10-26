const { prisma } = require("../config/db.js");

exports.getChatUsers = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);

    const me = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        Fullname: true,
        Email: true,
      },
    });

    if (!me) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        Fullname: true,
        Email: true,
      },
    });

    return res.status(200).json({
      me: {
        _id: me.id,
        Fullname: me.Fullname,
        Email: me.Email,
      },
      users: users.map((user) => ({
        _id: user.id,
        Fullname: user.Fullname,
        Email: user.Email,
      })),
    });
  } catch (error) {
    console.error("getChatUsers error:", error);

    return res.status(500).json({
      message: "Failed to load users",
    });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.params.userId);

    // Validate user IDs
    if (
      !Number.isSafeInteger(currentUserId) ||
      currentUserId <= 0 ||
      !Number.isSafeInteger(otherUserId) ||
      otherUserId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Prevent chatting with yourself
    if (currentUserId === otherUserId) {
      return res.status(400).json({
        message: "You cannot open a chat with yourself",
      });
    }

    // Check whether the other user exists
    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    console.log(
      "Fetching messages between users:",
      currentUserId,
      otherUserId
    );

    // Fetch messages in both directions
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        text: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    console.log("Messages retrieved successfully:", messages);

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);

    return res.status(500).json({
      message: "Failed to load messages",
    });
  }
};
