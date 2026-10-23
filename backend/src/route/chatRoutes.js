const express = require("express");
const router = express.Router();
const {
  getChatUsers,
  getMessages,
} = require("../controller/chatController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
router.get("/users", authMiddleware, getChatUsers);
router.get("/:userId/messages", authMiddleware, getMessages);
module.exports = router;