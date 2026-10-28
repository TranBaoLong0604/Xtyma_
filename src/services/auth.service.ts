
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export async function loginUser(
  identifier: string,
  password: string,
) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      passwordHash: true,
      role: true,
      student: {
        select: { id: true },
      },
      teacher: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  const passwordIsValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordIsValid) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;

  return safeUser;
}
