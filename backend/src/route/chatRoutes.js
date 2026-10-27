const express = require("express");
const router = express.Router();
const {
  getChatUsers,
  getMessages,
  uploadFile
} = require("../controller/chatController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const upload = require('../middleware/uploadMiddleware.js')
router.get("/users", authMiddleware, getChatUsers);
router.get("/:userId/messages", authMiddleware, getMessages);
router.post("/:userId/upload", authMiddleware,upload.single("file") ,uploadFile)
module.exports = router;