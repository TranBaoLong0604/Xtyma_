
import type { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/auth.schema";
import { loginUser } from "../services/auth.service";

export async function authRoutes(app: FastifyInstance) {
  app.post("/api/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: "Dữ liệu đăng nhập không hợp lệ",
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const user = await loginUser(
      parsed.data.identifier,
      parsed.data.password,
    );

    if (!user) {
      return reply.code(401).send({
        error: "Tên đăng nhập hoặc mật khẩu không chính xác",
      });
    }

    const token = app.jwt.sign({
      sub: user.id,
      role: user.role,
    });

    return reply.send({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: user.student?.id ?? null,
        teacherId: user.teacher?.id ?? null,
      },
    });
  });
}
