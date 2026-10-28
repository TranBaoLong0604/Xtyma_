import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export async function getStudents() {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      studentCode: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  return {
    total: students.length,
    students,
  };
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    select: {
      id: true,
      studentCode: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
    },
  });
}

export async function createStudent(data: {
  username: string;
  email: string;
  password: string;
  studentCode: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: data.username }, { email: data.email }],
    },
    select: { id: true },
  });

  if (existingUser) {
    return { conflict: "USERNAME_OR_EMAIL" as const };
  }

  const existingStudent = await prisma.student.findUnique({
    where: { studentCode: data.studentCode },
    select: { id: true },
  });

  if (existingStudent) {
    return { conflict: "STUDENT_CODE" as const };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: "STUDENT",
      },
    });

    return tx.student.create({
      data: {
        userId: user.id,
        studentCode: data.studentCode,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth
          ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
          : undefined,
        gender: data.gender,
      },
      select: {
        id: true,
        studentCode: true,
        fullName: true,
        dateOfBirth: true,
        gender: true,
      },
    });
  });

  return { student };
}

export async function updateStudent(
  id: string,
  data: {
    fullName?: string;
    dateOfBirth?: string | null;
    gender?: "MALE" | "FEMALE" | "OTHER" | null;
  },
) {
  const existingStudent = await prisma.student.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingStudent) {
    return null;
  }

  return prisma.student.update({
    where: { id },
    data: {
      ...(data.fullName !== undefined && {
        fullName: data.fullName,
      }),
      ...(data.dateOfBirth !== undefined && {
        dateOfBirth: data.dateOfBirth
          ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
          : null,
      }),
      ...(data.gender !== undefined && {
        gender: data.gender,
      }),
    },
    select: {
      id: true,
      studentCode: true,
      fullName: true,
      dateOfBirth: true,
      gender: true,
    },
  });
}