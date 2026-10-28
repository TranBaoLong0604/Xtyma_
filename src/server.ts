
import Fastify from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import { studentRoutes } from "./routes/students.routes";
const app = Fastify({
  logger: true,
});
app.register(studentRoutes);

app.get("/", async () => {
  const userCount = await prisma.user.count();

  return {
    message: "Xtyma_ API is running",
    database: "connected",
    userCount,
  };
});

const start = async () => {
  try {
    await prisma.$connect();

    await app.listen({
      port: 3000,
      host: "127.0.0.1",
    });

    console.log("Xtyma_ API is running at http://127.0.0.1:3000");
  } catch (error) {
    app.log.error(error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
};

start();
