import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("XtymaDemo123!", 12);

  const user = await prisma.user.upsert({
    where: { username: "student_demo" },
    update: {},
    create: {
      username: "student_demo",
      email: "student.demo@example.com",
      emailVerified: false,
      passwordHash,
      role: "STUDENT",
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      studentCode: "STU-DEMO-001",
      fullName: "Nguyen Van An",
      gender: "MALE",
    },
  });

  console.log("Created demo student:", {
    username: user.username,
    studentCode: student.studentCode,
    fullName: student.fullName,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
