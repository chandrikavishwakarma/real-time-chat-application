const express = require("express");
const app = express();
const authRoute = require("./route/authRoute");
const userRoute = require("./route/userRoutes");
const chatRoutes = require("./route/chatRoutes.js");

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoutes);

module.exports = app;