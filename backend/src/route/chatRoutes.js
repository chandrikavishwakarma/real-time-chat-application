const express = require("express");
const router = express.Router();
const {
  getChatUsers,
  getMessages,
  uploadFile,
} = require("../controller/chatController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");

/**
 * @swagger
 * /api/chat/users:
 *   get:
 *     summary: Get all registered chat users
 *     description: Retrieves the logged-in user's details and the list of other registered users.
 *     tags:
 *       - Chat
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 me:
 *                   type: object
 *                   description: Logged-in user details
 *                   properties:
 *                     _id:
 *                       type: integer
 *                       example: 1
 *                     Fullname:
 *                       type: string
 *                       example: john doe
 *                     Email:
 *                       type: string
 *                       example: john@example.com
 *                 users:
 *                   type: array
 *                   description: List of other registered users
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                         example: 2
 *                       Fullname:
 *                         type: string
 *                         example: Rahul Sharma
 *                       Email:
 *                         type: string
 *                         example: rahul@example.com
 *       '404':
 *         description: User not found!
 *       '500':
 *         description: Internal server error
 */
router.get(
  "/users", 
  authMiddleware, 
  getChatUsers
);

/**
 * @swagger
 * /api/chat/{userId}/messages:
 *   get:
 *     summary: Get messages between logged-in user and another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the other user
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: integer
 *                       senderId:
 *                         type: integer
 *                       receiverId:
 *                         type: integer
 *                       text:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Invalid user Id
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:userId/messages", 
  authMiddleware, 
  getMessages
);

/**
 * @swagger
 * /api/chat/{userId}/upload:
 *   post:
 *     summary: Upload a file to a chat
 *     description: Upload a file for a specific user. The file is uploaded using the authenticated user's JWT token.
 *     tags: [Chat]
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the receiver user
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *             required:
 *               - file
 *
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 fileUrl:
 *                   type: string
 *                   example: https://res.cloudinary.com/demo/image/upload/sample.jpg
 *
 *       400:
 *         description: Invalid user Id
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:userId/upload",
  authMiddleware,
  upload.single("file"),
  uploadFile,
);

module.exports = router;
