import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { CategorySchema, CreateCategorySchema, UpdateCategorySchema } from "./categoryModel";

export const categoryRegistry = new OpenAPIRegistry();

// Register category schemas
categoryRegistry.register("Category", CategorySchema);
categoryRegistry.register("CreateCategory", CreateCategorySchema);
categoryRegistry.register("UpdateCategory", UpdateCategorySchema);

// Common parameter schemas
const CategoryIdParamsSchema = z.object({
	id: z.string().transform(Number),
});

// Register OpenAPI paths
categoryRegistry.registerPath({
	method: "post",
	path: "/categories",
	description: "Create a new category",
	summary: "Create category",
	tags: ["Categories"],
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			description: "Category creation data",
			content: {
				"application/json": {
					schema: CreateCategorySchema,
				},
			},
		},
	},
	responses: createApiResponse(CategorySchema, "Category created successfully"),
});

categoryRegistry.registerPath({
	method: "get",
	path: "/categories",
	description: "Get all categories",
	summary: "Get categories",
	tags: ["Categories"],
	security: [{ bearerAuth: [] }],
	responses: createApiResponse(CategorySchema.array(), "Categories retrieved successfully"),
});

categoryRegistry.registerPath({
	method: "get",
	path: "/categories/{id}",
	description: "Get category by ID",
	summary: "Get category",
	tags: ["Categories"],
	security: [{ bearerAuth: [] }],
	request: {
		params: CategoryIdParamsSchema,
	},
	responses: createApiResponse(CategorySchema, "Category retrieved successfully"),
});

categoryRegistry.registerPath({
	method: "put",
	path: "/categories/{id}",
	description: "Update category by ID",
	summary: "Update category",
	tags: ["Categories"],
	security: [{ bearerAuth: [] }],
	request: {
		params: CategoryIdParamsSchema,
		body: {
			description: "Category update data",
			content: {
				"application/json": {
					schema: UpdateCategorySchema,
				},
			},
		},
	},
	responses: createApiResponse(CategorySchema, "Category updated successfully"),
});

categoryRegistry.registerPath({
	method: "delete",
	path: "/categories/{id}",
	description: "Delete category by ID",
	summary: "Delete category",
	tags: ["Categories"],
	security: [{ bearerAuth: [] }],
	request: {
		params: CategoryIdParamsSchema,
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Category deleted successfully"),
});
