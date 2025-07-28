import { z } from "zod";

// Base project schema
export const ProjectSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required").max(255),
	description: z.string().optional(),
	status: z.enum(["active", "completed", "archived"]).default("active"),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	ownerId: z.number(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// Schema for creating a project
export const CreateProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(255),
	description: z.string().optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
	memberIds: z.array(z.number()).optional(), // Initial members to add
});

// Schema for updating a project
export const UpdateProjectSchema = z.object({
	name: z.string().min(1, "Name is required").max(255).optional(),
	description: z.string().optional(),
	status: z.enum(["active", "completed", "archived"]).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	startDate: z.string().datetime().optional(),
	endDate: z.string().datetime().optional(),
});

// Schema for adding/removing project members
export const ProjectMemberSchema = z.object({
	userId: z.number(),
	role: z.enum(["owner", "admin", "member"]).default("member"),
});

export const AddProjectMembersSchema = z.object({
	members: z.array(ProjectMemberSchema),
});

// Schema for updating member role
export const UpdateMemberRoleSchema = z.object({
	role: z.enum(["owner", "admin", "member"]),
});

// Schema for project query params
export const GetProjectsQuerySchema = z.object({
	status: z.enum(["active", "completed", "archived"]).optional(),
	priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
	ownerId: z.number().optional(),
	memberId: z.number().optional(),
	search: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(10),
});

// Extended project schema with relations
export const ProjectWithDetailsSchema = ProjectSchema.extend({
	owner: z.object({
		id: z.number(),
		name: z.string(),
		email: z.string(),
		avatar: z.string().optional(),
	}),
	members: z.array(
		z.object({
			id: z.number(),
			userId: z.number(),
			role: z.string(),
			user: z.object({
				id: z.number(),
				name: z.string(),
				email: z.string(),
				avatar: z.string().optional(),
			}),
			joinedAt: z.string().datetime(),
		}),
	),
	tasksCount: z.number().optional(),
	completedTasksCount: z.number().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type CreateProject = z.infer<typeof CreateProjectSchema>;
export type UpdateProject = z.infer<typeof UpdateProjectSchema>;
export type ProjectMember = z.infer<typeof ProjectMemberSchema>;
export type AddProjectMembers = z.infer<typeof AddProjectMembersSchema>;
export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;
export type GetProjectsQuery = z.infer<typeof GetProjectsQuerySchema>;
export type ProjectWithDetails = z.infer<typeof ProjectWithDetailsSchema>;
