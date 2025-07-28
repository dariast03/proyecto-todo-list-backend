import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

import { authRegistry } from "@/api/auth/authRouter";
import { categoryRegistry } from "@/api/category/categoryRouter";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { projectRegistry } from "@/api/project/projectRouter";
import { taskRegistry } from "@/api/task/taskRouter";
import { userRegistry } from "@/api/user/userRouter";

export type OpenAPIDocument = ReturnType<OpenApiGeneratorV3["generateDocument"]>;

export function generateOpenAPIDocument(): OpenAPIDocument {
	const registry = new OpenAPIRegistry([
		healthCheckRegistry,
		userRegistry,
		authRegistry,
		projectRegistry,
		taskRegistry,
		categoryRegistry,
	]);

	// Register security scheme
	registry.registerComponent("securitySchemes", "bearerAuth", {
		type: "http",
		scheme: "bearer",
		bearerFormat: "JWT",
	});

	const generator = new OpenApiGeneratorV3(registry.definitions);

	return generator.generateDocument({
		openapi: "3.0.0",
		info: {
			version: "1.0.0",
			title: "Project & Task Management API",
			description: "A comprehensive API for managing projects, tasks, categories, and user authentication",
		},
		externalDocs: {
			description: "View the raw OpenAPI Specification in JSON format",
			url: "/swagger.json",
		},
	});
}
