import z from "zod";

export const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodGroup: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email format" }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, { message: "Password must be at least 6 characters" }),
});