import { z } from "zod";

// Base task schema
export const TaskSchema = z.object({
	id: z.number(),
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	completed: z.boolean().default(false),
	dueDate: z.string().datetime().optional(),
	reminderDate: z.string().datetime().optional(),
	estimatedHours: z.number().positive().optional(),
	actualHours: z.number().positive().optional(),
	projectId: z.number().optional(),
	categoryId: z.number().optional(),
	assignedToId: z.number().optional(),
	createdById: z.number(),
	parentTaskId: z.number().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// Schema for creating a task
export const CreateTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255),
	description: z.string().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	dueDate: z.string().datetime().optional(),
	reminderDate: z.string().datetime().optional(),
	estimatedHours: z.number().positive().optional(),
	projectId: z.number().optional(),
	categoryId: z.number().optional(),
	assignedToId: z.number().optional(),
	parentTaskId: z.number().optional(),
});

// Schema for updating a task
export const UpdateTaskSchema = z.object({
	title: z.string().min(1, "Title is required").max(255).optional(),
	description: z.string().optional(),
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	completed: z.boolean().optional(),
	dueDate: z.string().datetime().optional(),
	reminderDate: z.string().datetime().optional(),
	estimatedHours: z.number().positive().optional(),
	actualHours: z.number().positive().optional(),
	categoryId: z.number().optional(),
	assignedToId: z.number().optional(),
});

// Schema for task query params
export const GetTasksQuerySchema = z.object({
	status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	completed: z
		.string()
		.optional()
		.transform((val) => val === "true")
		.or(z.boolean().optional()),
	projectId: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined))
		.or(z.number().optional()),
	categoryId: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined))
		.or(z.number().optional()),
	assignedToId: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined))
		.or(z.number().optional()),
	createdById: z
		.string()
		.optional()
		.transform((val) => (val ? Number(val) : undefined))
		.or(z.number().optional()),
	dueDate: z.string().optional(), // Filter by date range
	search: z.string().optional(),
	includeSubtasks: z
		.string()
		.optional()
		.transform((val) => val !== "false") // Default to true unless explicitly "false"
		.or(z.boolean().optional())
		.default(true),
	sortBy: z.enum(["createdAt", "dueDate", "priority", "title"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for task comment
export const TaskCommentSchema = z.object({
	id: z.number(),
	content: z.string().min(1, "Comment content is required"),
	taskId: z.number(),
	userId: z.number(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export const CreateTaskCommentSchema = z.object({
	content: z.string().min(1, "Comment content is required"),
});

export const UpdateTaskCommentSchema = z.object({
	content: z.string().min(1, "Comment content is required"),
});

// Schema for task attachment
export const TaskAttachmentSchema = z.object({
	id: z.number(),
	fileName: z.string(),
	fileUrl: z.string(),
	fileSize: z.number().optional(),
	mimeType: z.string().optional(),
	taskId: z.number(),
	uploadedById: z.number(),
	createdAt: z.string().datetime(),
});

export const CreateTaskAttachmentSchema = z.object({
	fileName: z.string().min(1, "File name is required"),
	fileUrl: z.string().url("Valid file URL is required"),
	fileSize: z.number().positive().optional(),
	mimeType: z.string().optional(),
});

// Extended task schema with relations
export const TaskWithDetailsSchema = TaskSchema.extend({
	project: z
		.object({
			id: z.number(),
			name: z.string(),
			status: z.string(),
		})
		.optional(),
	category: z
		.object({
			id: z.number(),
			name: z.string(),
			color: z.string(),
		})
		.optional(),
	assignedTo: z
		.object({
			id: z.number(),
			name: z.string(),
			email: z.string(),
			avatar: z.string().optional(),
		})
		.optional(),
	createdBy: z.object({
		id: z.number(),
		name: z.string(),
		email: z.string(),
		avatar: z.string().optional(),
	}),
	parentTask: z
		.object({
			id: z.number(),
			title: z.string(),
			status: z.string(),
		})
		.optional(),
	subtasks: z
		.array(
			z.object({
				id: z.number(),
				title: z.string(),
				status: z.string(),
				completed: z.boolean(),
				assignedTo: z
					.object({
						id: z.number(),
						name: z.string(),
					})
					.optional(),
			}),
		)
		.optional(),
	comments: z
		.array(
			TaskCommentSchema.extend({
				user: z.object({
					id: z.number(),
					name: z.string(),
					avatar: z.string().optional(),
				}),
			}),
		)
		.optional(),
	attachments: z
		.array(
			TaskAttachmentSchema.extend({
				uploadedBy: z.object({
					id: z.number(),
					name: z.string(),
				}),
			}),
		)
		.optional(),
});

// Type exports
export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;
export type GetTasksQuery = z.infer<typeof GetTasksQuerySchema>;
export type TaskComment = z.infer<typeof TaskCommentSchema>;
export type CreateTaskComment = z.infer<typeof CreateTaskCommentSchema>;
export type UpdateTaskComment = z.infer<typeof UpdateTaskCommentSchema>;
export type TaskAttachment = z.infer<typeof TaskAttachmentSchema>;
export type CreateTaskAttachment = z.infer<typeof CreateTaskAttachmentSchema>;
export type TaskWithDetails = z.infer<typeof TaskWithDetailsSchema>;
