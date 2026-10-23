const { prisma } = require("../config/db.js");

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        Fullname: true,
        Email: true,
      },
    });

    res.status(200).json({
      users: users.map((user) => ({
        _id: user.id,
        Fullname: user.Fullname,
        Email: user.Email,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = { getAllUsers };