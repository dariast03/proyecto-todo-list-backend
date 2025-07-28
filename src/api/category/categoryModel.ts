import { z } from "zod";

// Base category schema
export const CategorySchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required").max(100),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.default("#3B82F6"),
	description: z.string().optional(),
	userId: z.number().optional(), // null for global categories
	createdAt: z.string().datetime(),
});

// Schema for creating a category
export const CreateCategorySchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.default("#3B82F6"),
	description: z.string().optional(),
	isGlobal: z.boolean().default(false), // Whether it's a global category
});

// Schema for updating a category
export const UpdateCategorySchema = z.object({
	name: z.string().min(1, "Name is required").max(100).optional(),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
		.optional(),
	description: z.string().optional(),
});

// Schema for category query params
export const GetCategoriesQuerySchema = z.object({
	userId: z.number().optional(),
	includeGlobal: z.boolean().default(true),
	search: z.string().optional(),
});

// Extended category schema with task count
export const CategoryWithStatsSchema = CategorySchema.extend({
	taskCount: z.number().optional(),
	completedTaskCount: z.number().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type GetCategoriesQuery = z.infer<typeof GetCategoriesQuerySchema>;
export type CategoryWithStats = z.infer<typeof CategoryWithStatsSchema>;
