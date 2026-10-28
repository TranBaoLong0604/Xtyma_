
import "dotenv/config";
import fastifyJwt from "@fastify/jwt";
import Fastify from "fastify";
import { prisma } from "./lib/prisma";
import { studentRoutes } from "./routes/students.routes";
import { authRoutes } from "./routes/auth.routes";
const app = Fastify({
  logger: true,
});

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET phải có ít nhất 32 ký tự");
}

app.register(fastifyJwt, {
  secret: jwtSecret,
  sign: {
    expiresIn: "1h",
  },
});

app.register(authRoutes);

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
