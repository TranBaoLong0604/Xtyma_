
import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Vui lòng nhập username hoặc email"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
