
import type { FastifyInstance } from "fastify";
import {
  createStudentSchema,
  studentIdSchema,
  updateStudentSchema,
} from "../schemas/students.schema";
import {
  createStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../services/students.service";

export async function studentRoutes(app: FastifyInstance) {
  app.get("/api/students", async () => {
    return getStudents();
  });

  app.get("/api/students/:id", async (request, reply) => {
    const parsedParams = studentIdSchema.safeParse(request.params);

    if (!parsedParams.success) {
      return reply.code(400).send({
        error: "ID học sinh không hợp lệ",
      });
    }

    const student = await getStudentById(parsedParams.data.id);

    if (!student) {
      return reply.code(404).send({
        error: "Không tìm thấy học sinh",
      });
    }

    return reply.send({ student });
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

    const result = await createStudent(parsed.data);

    if ("conflict" in result) {
      return reply.code(409).send({
        error:
          result.conflict === "STUDENT_CODE"
            ? "Mã học sinh đã tồn tại"
            : "Username hoặc email đã tồn tại",
      });
    }

    return reply.code(201).send({
      message: "Tạo học sinh thành công",
      student: result.student,
    });
  });

  app.put("/api/students/:id", async (request, reply) => {
    const parsedParams = studentIdSchema.safeParse(request.params);

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

    const student = await updateStudent(
      parsedParams.data.id,
      parsedBody.data,
    );

    if (!student) {
      return reply.code(404).send({
        error: "Không tìm thấy học sinh",
      });
    }

    return reply.send({
      message: "Cập nhật học sinh thành công",
      student,
    });
  });
}
