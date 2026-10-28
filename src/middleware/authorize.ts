
import type { FastifyReply, FastifyRequest } from "fastify";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export function authorize(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { sub?: string; role?: string } | undefined;

    if (!user?.sub || !user.role) {
      return reply.code(401).send({
        error: "Thông tin đăng nhập không hợp lệ",
      });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return reply.code(403).send({
        error: "Bạn không có quyền thực hiện thao tác này",
      });
    }
  };
}
