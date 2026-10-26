const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const dbConnect = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL successfully on port 5432");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

module.exports = { prisma, dbConnect };
