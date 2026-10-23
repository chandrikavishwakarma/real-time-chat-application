
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const dbConnect = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL successfully");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
  }
};

module.exports = { prisma, dbConnect };
