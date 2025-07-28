import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import {
	CreateUserSchema,
	GetUserSchema,
	GetUsersQuerySchema,
	UpdateUserSchema,
	UserSchema,
} from "@/api/user/userModel";
import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { validateRequest } from "@/common/utils/httpHandlers";
import { userController } from "./userController";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

userRegistry.register("User", UserSchema);

// Create user
userRegistry.registerPath({
	method: "post",
	path: "/users",
	tags: ["User"],
	request: { body: { content: { "application/json": { schema: CreateUserSchema } } } },
	responses: createApiResponse(UserSchema, "User created successfully"),
});

userRouter.post("/", validateRequest(CreateUserSchema), userController.createUser);

// Get all users with filters
userRegistry.registerPath({
	method: "get",
	path: "/users",
	tags: ["User"],
	request: { query: GetUsersQuerySchema },
	responses: createApiResponse(z.array(UserSchema), "Users retrieved successfully"),
});

userRouter.get("/", validateRequest(GetUsersQuerySchema), userController.getUsers);

// Get users simple (for dropdowns)
userRegistry.registerPath({
	method: "get",
	path: "/users/simple",
	tags: ["User"],
	responses: createApiResponse(z.array(UserSchema), "Users retrieved successfully"),
});

userRouter.get("/simple", userController.getUsersSimple);

// Get current user profile
userRegistry.registerPath({
	method: "get",
	path: "/users/me",
	tags: ["User"],
	responses: createApiResponse(UserSchema, "User profile retrieved successfully"),
});

userRouter.get("/me", userController.getMyProfile);

// Get user by ID
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "User retrieved successfully"),
});

userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);

// Get user profile with stats
userRegistry.registerPath({
	method: "get",
	path: "/users/{id}/profile",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(UserSchema, "User profile retrieved successfully"),
});

userRouter.get("/:id/profile", validateRequest(GetUserSchema), userController.getUserProfile);

// Update user
userRegistry.registerPath({
	method: "put",
	path: "/users/{id}",
	tags: ["User"],
	request: {
		params: GetUserSchema.shape.params,
		body: { content: { "application/json": { schema: UpdateUserSchema } } },
	},
	responses: createApiResponse(UserSchema, "User updated successfully"),
});

userRouter.put("/:id", validateRequest(UpdateUserSchema), userController.updateUser);

// Delete user
userRegistry.registerPath({
	method: "delete",
	path: "/users/{id}",
	tags: ["User"],
	request: { params: GetUserSchema.shape.params },
	responses: createApiResponse(z.object({}), "User deleted successfully"),
});

userRouter.delete("/:id", validateRequest(GetUserSchema), userController.deleteUser);
