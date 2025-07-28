import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CreateTaskSchema, GetTasksQuerySchema, TaskSchema, UpdateTaskSchema } from "./taskModel";

export const taskRegistry = new OpenAPIRegistry();

// Register task schemas
taskRegistry.register("Task", TaskSchema);
taskRegistry.register("CreateTask", CreateTaskSchema);
taskRegistry.register("UpdateTask", UpdateTaskSchema);
taskRegistry.register("GetTasksQuery", GetTasksQuerySchema);

// Common parameter schemas
const TaskIdParamsSchema = z.object({
	id: z.string().transform(Number),
});

// Register OpenAPI paths
taskRegistry.registerPath({
	method: "post",
	path: "/tasks",
	description: "Create a new task",
	summary: "Create task",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			description: "Task creation data",
			content: {
				"application/json": {
					schema: CreateTaskSchema,
				},
			},
		},
	},
	responses: createApiResponse(TaskSchema, "Task created successfully"),
});

taskRegistry.registerPath({
	method: "get",
	path: "/tasks",
	description: "Get tasks with optional filters",
	summary: "Get tasks",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		query: GetTasksQuerySchema,
	},
	responses: createApiResponse(TaskSchema.array(), "Tasks retrieved successfully"),
});

taskRegistry.registerPath({
	method: "get",
	path: "/tasks/{id}",
	description: "Get task by ID",
	summary: "Get task",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		params: TaskIdParamsSchema,
	},
	responses: createApiResponse(TaskSchema, "Task retrieved successfully"),
});

taskRegistry.registerPath({
	method: "put",
	path: "/tasks/{id}",
	description: "Update task by ID",
	summary: "Update task",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		params: TaskIdParamsSchema,
		body: {
			description: "Task update data",
			content: {
				"application/json": {
					schema: UpdateTaskSchema,
				},
			},
		},
	},
	responses: createApiResponse(TaskSchema, "Task updated successfully"),
});

taskRegistry.registerPath({
	method: "delete",
	path: "/tasks/{id}",
	description: "Delete task by ID",
	summary: "Delete task",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		params: TaskIdParamsSchema,
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Task deleted successfully"),
});

taskRegistry.registerPath({
	method: "patch",
	path: "/tasks/{id}/status",
	description: "Update task status",
	summary: "Update task status",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		params: TaskIdParamsSchema,
		body: {
			description: "Status update data",
			content: {
				"application/json": {
					schema: z.object({
						status: z.enum(["pending", "in_progress", "completed"]),
					}),
				},
			},
		},
	},
	responses: createApiResponse(TaskSchema, "Task status updated successfully"),
});

taskRegistry.registerPath({
	method: "patch",
	path: "/tasks/{id}/assign",
	description: "Assign task to user",
	summary: "Assign task",
	tags: ["Tasks"],
	security: [{ bearerAuth: [] }],
	request: {
		params: TaskIdParamsSchema,
		body: {
			description: "Assignment data",
			content: {
				"application/json": {
					schema: z.object({
						assignedToId: z.number().nullable(),
					}),
				},
			},
		},
	},
	responses: createApiResponse(TaskSchema, "Task assigned successfully"),
});
