
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    throw new Error("Username phải dài 3-50 ký tự, gồm chữ, số hoặc _");
  }

  if (
    !email ||
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Email không hợp lệ");
  }

  if (!password || password.length < 12) {
    throw new Error("Mật khẩu ADMIN phải có ít nhất 12 ký tự");
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("Username hoặc email đã tồn tại");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Đã tạo tài khoản ADMIN: ${username}`);
}

main()
  .catch((error: unknown) => {
    console.error(
      "Không thể tạo ADMIN:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
