const { prisma } = require("../config/db.js");
const uploadCloudinaryFile = require('../utils/uploadCloudinaryFile.js')
const getChatUsers = async (req, res) => {
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

const getMessages = async (req, res) => {
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

    // console.log(
    //   "Fetching messages between users:",
    //   currentUserId,
    //   otherUserId
    // );

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
        fileName: true,
        fileType: true,
        fileUrl: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // console.log("Messages retrieved successfully:", messages);

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);

    return res.status(500).json({
      message: "Failed to load messages",
    });
  }
};

const uploadFile = async (req, res) => {
  let uploadedFile;
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.params.userId);
    const file = req.file;
    if (
      !Number.isSafeInteger(currentUserId) ||
      currentUserId <= 0 ||
      !Number.isSafeInteger(otherUserId) ||
      otherUserId <= 0
    ) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    if (currentUserId === otherUserId) {
      return res
        .status(400)
        .json({ message: "You cannot send file to yourself!" });
    }

    if (!file) {
      return res.status(400).json({ message: "file not uploaded!" });
    }
    const receiver = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true },
    });
    if (!receiver) {
      console.log("receiver has not found!");
      return res.status(400).json({ message: "reciever not found!" });
    }
    if(req.file){
      uploadedFile = await uploadCloudinaryFile(req.file)
    }
    // console.log(uploadFile)
    console.log("Request body:", req.body);
console.log("Message text:", req.body?.text);
console.log("Uploaded file:", uploadedFile);
    const message = await prisma.message.create({
      data: {
        sender: {
          connect: { id: currentUserId },
        },
        receiver: {
          connect: { id: otherUserId },
        },
        text:  req.body?.text?.trim() || "",
        fileName: file.originalname,
        fileUrl:  uploadedFile.secure_url,
        fileType: file.mimetype,
        fileSize: file.size,
        publicId: uploadedFile.public_id
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        text: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        publicId: true,
        createdAt: true,
      },
    });
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${currentUserId}`)
        .to(`user:${otherUserId}`)
        .emit("new_message", message);
    }
    return res.status(201).json({ message: "file uploaded!", file: message });
  } catch (err) {
    console.error("upload file error:", err);
    return res.status(500).json({
      message: "failed to upload the file!",
      error: err.message,
    });
  }
};
module.exports = {
  getChatUsers,
  getMessages,
  uploadFile,
};
