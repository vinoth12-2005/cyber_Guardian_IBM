import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const registerStep1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  country: z.string().min(1, "Select your country"),
});

export type RegisterStep1FormData = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z
  .object({
    organization: z.string().min(1, "Organization is required"),
    role: z.string().min(1, "Select your role"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterStep2FormData = z.infer<typeof registerStep2Schema>;

export const registerStep3Schema = z.object({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Service" }),
  }),
  newsletter: z.boolean().optional(),
});

export type RegisterStep3FormData = z.infer<typeof registerStep3Schema>;

export const registerSchema = registerStep1Schema
  .merge(
    z.object({
      organization: z.string().min(1, "Organization is required"),
      role: z.string().min(1, "Select your role"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Include at least one uppercase letter")
        .regex(/[0-9]/, "Include at least one number")
        .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
      confirmPassword: z.string().min(1, "Confirm your password"),
      acceptTerms: z.literal(true, {
        errorMap: () => ({ message: "You must accept the Terms of Service" }),
      }),
      newsletter: z.boolean().optional(),
    })
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
