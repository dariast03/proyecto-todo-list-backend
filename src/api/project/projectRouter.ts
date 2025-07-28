import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { projectController } from "./projectController";
import {
	AddProjectMembersSchema,
	CreateProjectSchema,
	GetProjectsQuerySchema,
	ProjectSchema,
	UpdateMemberRoleSchema,
	UpdateProjectSchema,
} from "./projectModel";

export const projectRegistry = new OpenAPIRegistry();
const projectRouter: Router = Router();

// Register project schemas
projectRegistry.register("Project", ProjectSchema);
projectRegistry.register("CreateProject", CreateProjectSchema);
projectRegistry.register("UpdateProject", UpdateProjectSchema);
projectRegistry.register("AddProjectMembers", AddProjectMembersSchema);
projectRegistry.register("UpdateMemberRole", UpdateMemberRoleSchema);
projectRegistry.register("GetProjectsQuery", GetProjectsQuerySchema);

// Common parameter schemas
const ProjectIdParamsSchema = z.object({
	id: z.string().transform(Number),
});

// Register OpenAPI paths
projectRegistry.registerPath({
	method: "post",
	path: "/projects",
	description: "Create a new project",
	summary: "Create project",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			description: "Project creation data",
			content: {
				"application/json": {
					schema: CreateProjectSchema,
				},
			},
		},
	},
	responses: createApiResponse(ProjectSchema, "Project created successfully"),
});

projectRegistry.registerPath({
	method: "get",
	path: "/projects",
	description: "Get all projects with optional filters",
	summary: "Get projects",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		query: GetProjectsQuerySchema,
	},
	responses: createApiResponse(ProjectSchema.array(), "Projects retrieved successfully"),
});

projectRegistry.registerPath({
	method: "get",
	path: "/projects/my-projects",
	description: "Get current user's projects",
	summary: "Get user projects",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	responses: createApiResponse(ProjectSchema.array(), "User projects retrieved successfully"),
});

projectRegistry.registerPath({
	method: "get",
	path: "/projects/{id}",
	description: "Get project by ID",
	summary: "Get project",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
	},
	responses: createApiResponse(ProjectSchema, "Project retrieved successfully"),
});

projectRegistry.registerPath({
	method: "put",
	path: "/projects/{id}",
	description: "Update project by ID",
	summary: "Update project",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
		body: {
			description: "Project update data",
			content: {
				"application/json": {
					schema: UpdateProjectSchema,
				},
			},
		},
	},
	responses: createApiResponse(ProjectSchema, "Project updated successfully"),
});

projectRegistry.registerPath({
	method: "delete",
	path: "/projects/{id}",
	description: "Delete project by ID",
	summary: "Delete project",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Project deleted successfully"),
});

projectRegistry.registerPath({
	method: "post",
	path: "/projects/{id}/members",
	description: "Add members to project",
	summary: "Add project members",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
		body: {
			description: "Members to add",
			content: {
				"application/json": {
					schema: AddProjectMembersSchema,
				},
			},
		},
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Members added successfully"),
});

projectRegistry.registerPath({
	method: "patch",
	path: "/projects/{id}/members/role",
	description: "Update member role in project",
	summary: "Update member role",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
		body: {
			description: "Role update data",
			content: {
				"application/json": {
					schema: UpdateMemberRoleSchema,
				},
			},
		},
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Member role updated successfully"),
});

projectRegistry.registerPath({
	method: "delete",
	path: "/projects/{id}/members",
	description: "Remove member from project",
	summary: "Remove project member",
	tags: ["Projects"],
	security: [{ bearerAuth: [] }],
	request: {
		params: ProjectIdParamsSchema,
		query: z.object({
			userId: z.string().transform(Number),
		}),
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Member removed successfully"),
});

// Create project
projectRouter.post("/", validateRequest(CreateProjectSchema), projectController.createProject);

// Get all projects with filters
projectRouter.get("/", validateRequest(GetProjectsQuerySchema), projectController.getProjects);

// Get user's projects
projectRouter.get("/my-projects", projectController.getUserProjects);

// Get project by ID
projectRouter.get("/:id", projectController.getProject);

// Update project
projectRouter.put("/:id", validateRequest(UpdateProjectSchema), projectController.updateProject);

// Delete project
projectRouter.delete("/:id", projectController.deleteProject);

// Add members to project
projectRouter.post("/:id/members", validateRequest(AddProjectMembersSchema), projectController.addProjectMembers);

// Remove member from project
projectRouter.delete("/:id/members/:memberId", projectController.removeProjectMember);

// Update member role
projectRouter.patch("/:id/members/:memberId/role", projectController.updateMemberRole);

export { projectRouter };
