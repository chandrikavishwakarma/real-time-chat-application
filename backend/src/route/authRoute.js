const express = require("express");
const { register, login } = require("../controller/authController.js");
const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in the Real-Time Chat Application.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Fullname
 *               - Email
 *               - Password
 *             properties:
 *               Fullname:
 *                 type: string
 *                 example: name surname
 *               Email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *               Password:
 *                 type: string
 *                 format: password
 *                 example: Test@12345
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Required fields are missing or invalid
 *       '409':
 *         description: User with this email already exists
 *       '500':
 *         description: Internal server error
 */

router.post("/register", register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *               - Password
 *             properties:
 *               Email:
 *                 type: string
 *                 example: user@example.com
 *               Password:
 *                 type: string
 *                 example: Test@123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */

router.post("/login", login)
module.exports = router;