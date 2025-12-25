import * as z from "zod";

export const UserValidations = {
  signup: z.object({
    body: z.object({
      name: z.string().min(3, "Name must contail atleast 3 characters"),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
    }),
  }),

  
};
