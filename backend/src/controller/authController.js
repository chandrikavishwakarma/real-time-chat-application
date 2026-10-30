const { prisma } = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { Fullname, Email, Password } = req.body;

    if (!Fullname || !Email || !Password) {
      return res.status(400).json({
        message: "Required fields are missing or invalid!",
      });
    }

    const findUser = await prisma.user.findUnique({
      where: { Email },
    });

    if (findUser) {
      return res.status(409).json({
        message: "User already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    await prisma.user.create({
      data: {
        Fullname,
        Email,
        Password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User registered successfully!",
    });
  } catch (err) {
    console.error(err);

    if (err.code === "P2002") {
      return res.status(409).json({
        message: "User already exists!",
      });
    }

    return res.status(500).json({
      message: "Internal server error!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    const isUserExists = await prisma.user.findUnique({
      where: { Email },
    });

    if (!isUserExists) {
      return res.status(400).json({
        message: "User not exist, please register first!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      Password,
      isUserExists.Password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Email Address or Password incorrect!",
      });
    }

    const token = jwt.sign(
      { id: isUserExists.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        _id: isUserExists.id,
        Fullname: isUserExists.Fullname,
        Email: isUserExists.Email,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "There is a server error!",
    });
  }
};

module.exports = { register, login }