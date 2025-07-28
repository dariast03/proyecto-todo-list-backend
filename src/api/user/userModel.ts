import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
	id: z.number(),
	firstName: z.string(),
	lastName: z.string(),
	email: z.string().email(),
	role: z.enum(["admin", "project_manager", "member"]).default("member"),
	avatar: z.string().url().optional(),
	isActive: z.boolean().default(true),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
	params: z.object({ id: commonValidations.id }),
});

// Schema for creating a user
export const CreateUserSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(255),
	lastName: z.string().min(1, "Last name is required").max(255),
	email: z.string().email("Valid email is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["admin", "project_manager", "member"]).default("member"),
	avatar: z.string().url().optional(),
});

// Schema for updating a user
export const UpdateUserSchema = z.object({
	firstName: z.string().min(1, "First name is required").max(255).optional(),
	lastName: z.string().min(1, "Last name is required").max(255).optional(),
	email: z.string().email("Valid email is required").optional(),
	role: z.enum(["admin", "project_manager", "member"]).optional(),
	avatar: z.string().url().optional(),
	isActive: z.boolean().optional(),
});

// Schema for user query params
export const GetUsersQuerySchema = z.object({
	role: z.enum(["admin", "project_manager", "member"]).optional(),
	search: z.string().optional(),
});

// User profile with stats
export const UserProfileSchema = UserSchema.extend({
	projectsCount: z.number().optional(),
	tasksCount: z.number().optional(),
	completedTasksCount: z.number().optional(),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
