
import Fastify from "fastify";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./lib/prisma";

const app = Fastify({
  logger: true,
});

const createStudentSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  studentCode: z.string().trim().min(1).max(50),
  fullName: z.string().trim().min(1).max(150),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});


const updateStudentSchema = z.object({
  fullName: z.string().trim().min(1).max(150).optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "Cần cung cấp ít nhất một trường để cập nhật" },
);


app.get("/", async () => {
  const userCount = await prisma.user.count();

  return {
    message: "Xtyma_ API is running",
    database: "connected",
    userCount,
  };
});

app.get("/api/students", async () => {
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
});

app.post("/api/students", async (request, reply) => {
  const parsed = createStudentSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.code(400).send({
      error: "Dữ liệu không hợp lệ",
      details: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const data = parsed.data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.email },
      ],
    },
    select: { id: true },
  });

  if (existingUser) {
    return reply.code(409).send({
      error: "Username hoặc email đã tồn tại",
    });
  }

  const existingStudent = await prisma.student.findUnique({
    where: { studentCode: data.studentCode },
    select: { id: true },
  });

  if (existingStudent) {
    return reply.code(409).send({
      error: "Mã học sinh đã tồn tại",
    });
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

  return reply.code(201).send({
    message: "Tạo học sinh thành công",
    student,
  });
});


app.put("/api/students/:id", async (request, reply) => {
  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const parsedParams = paramsSchema.safeParse(request.params);

  if (!parsedParams.success) {
    return reply.code(400).send({
      error: "ID học sinh không hợp lệ",
    });
  }

  const parsedBody = updateStudentSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.code(400).send({
      error: "Dữ liệu cập nhật không hợp lệ",
      details: parsedBody.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const data = parsedBody.data;
  const studentId = parsedParams.data.id;

  const existingStudent = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!existingStudent) {
    return reply.code(404).send({
      error: "Không tìm thấy học sinh",
    });
  }

  const student = await prisma.student.update({
    where: { id: studentId },
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

  return reply.send({
    message: "Cập nhật học sinh thành công",
    student,
  });
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
