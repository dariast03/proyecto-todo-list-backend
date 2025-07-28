import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Login schema
export const LoginSchema = z
	.object({
		email: z.string().email("Valid email is required"),
		password: z.string().min(6, "Password must be at least 6 characters"),
	})
	.openapi("LoginRequest");

// Register schema
export const RegisterSchema = z
	.object({
		firstName: z.string().min(1, "First name is required").max(255),
		lastName: z.string().min(1, "Last name is required").max(255),
		email: z.string().email("Valid email is required"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		role: z.enum(["admin", "project_manager", "member"]).default("member"),
		avatar: z.string().url().optional(),
	})
	.openapi("RegisterRequest");

// Reset password schema
export const ResetPasswordSchema = z.object({
	email: z.string().email("Valid email is required"),
});

// Change password schema
export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(6, "Current password is required"),
		newPassword: z.string().min(6, "New password must be at least 6 characters"),
	})
	.openapi("ChangePasswordRequest");

// Auth response schema
export const AuthResponseSchema = z
	.object({
		user: z.object({
			id: z.number(),
			firstName: z.string(),
			lastName: z.string(),
			email: z.string(),
			role: z.enum(["admin", "project_manager", "member"]),
			avatar: z.string().nullable().optional(),
			isActive: z.boolean(),
			createdAt: z.string().datetime(),
			updatedAt: z.string().datetime(),
		}),
		token: z.string(),
		refreshToken: z.string().optional(),
	})
	.openapi("AuthResponse");

// Refresh token schema
export const RefreshTokenSchema = z.object({
	refreshToken: z.string(),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
