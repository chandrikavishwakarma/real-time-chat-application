const express = require("express");
const router = express.Router();
const { getAllUsers } = require("../controller/userController.js");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all registered users
 *     description: Fetch all registered users from the PostgreSQL database.
 *     tags: [Users]
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: integer
 *                     example: 1
 *                   Fullname:
 *                     type: string
 *                     example: John
 *                   Email:
 *                     type: string
 *                     example: john@gmail.com
 *
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllUsers);
module.exports = router;