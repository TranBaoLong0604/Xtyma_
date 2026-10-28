import { z } from "zod";

export const createStudentSchema = z.object({
  username: z.string().trim().min(3).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  studentCode: z.string().trim().min(1).max(50),
  fullName: z.string().trim().min(1).max(150),
  dateOfBirth: z.string().date().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});

export const updateStudentSchema = z
  .object({
    fullName: z.string().trim().min(1).max(150).optional(),
    dateOfBirth: z.string().date().nullable().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Cần cung cấp ít nhất một trường để cập nhật",
  });

export const studentIdSchema = z.object({
  id: z.string().uuid(),
});
