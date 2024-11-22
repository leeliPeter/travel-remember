import * as z from "zod";

export const NewPasswordSchema = z.object({
  //include length and at least one letter and one number
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: "Password must contain at least one letter and one number",
    }),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
      message: "Password must contain at least one letter and one number",
    }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const TripSchema = z
  .object({
    name: z.string().min(1, {
      message: "Name is required",
    }),
    startDate: z.date().refine(
      (date) => {
        return !isNaN(date.getTime());
      },
      { message: "Please enter a valid date" }
    ),
    endDate: z.date().refine(
      (date) => {
        return !isNaN(date.getTime());
      },
      { message: "Please enter a valid date" }
    ),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      return data.endDate >= data.startDate;
    },
    {
      message: "End date must be the same as or after the start date",
      path: ["endDate"],
    }
  );
