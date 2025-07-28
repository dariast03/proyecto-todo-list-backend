import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { authenticateToken } from "@/common/middleware/authMiddleware";
import { authController } from "./authController";
import { AuthResponseSchema, ChangePasswordSchema, LoginSchema, RegisterSchema } from "./authModel";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

// POST /auth/register
authRegistry.registerPath({
	method: "post",
	path: "/auth/register",
	tags: ["Authentication"],
	summary: "Register a new user",
	request: {
		body: {
			description: "User registration data",
			content: {
				"application/json": {
					schema: RegisterSchema,
				},
			},
		},
	},
	responses: createApiResponse(AuthResponseSchema, "User registered successfully"),
});

// POST /auth/login
authRegistry.registerPath({
	method: "post",
	path: "/auth/login",
	tags: ["Authentication"],
	summary: "Login user",
	request: {
		body: {
			description: "User login credentials",
			content: {
				"application/json": {
					schema: LoginSchema,
				},
			},
		},
	},
	responses: createApiResponse(AuthResponseSchema, "User logged in successfully"),
});

// GET /auth/me
authRegistry.registerPath({
	method: "get",
	path: "/auth/me",
	tags: ["Authentication"],
	summary: "Get current user",
	security: [{ bearerAuth: [] }],
	responses: createApiResponse(
		z.object({
			id: z.number(),
			email: z.string(),
			firstName: z.string(),
			lastName: z.string(),
			isActive: z.boolean(),
			createdAt: z.string(),
			updatedAt: z.string(),
		}),
		"Current user retrieved successfully",
	),
});

// POST /auth/change-password
authRegistry.registerPath({
	method: "post",
	path: "/auth/change-password",
	tags: ["Authentication"],
	summary: "Change user password",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			description: "Password change data",
			content: {
				"application/json": {
					schema: ChangePasswordSchema,
				},
			},
		},
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Password changed successfully"),
});

// POST /auth/reset-password
authRegistry.registerPath({
	method: "post",
	path: "/auth/reset-password",
	tags: ["Authentication"],
	summary: "Reset user password",
	request: {
		body: {
			description: "Email for password reset",
			content: {
				"application/json": {
					schema: z.object({
						email: z.string().email(),
					}),
				},
			},
		},
	},
	responses: createApiResponse(z.object({ message: z.string() }), "Password reset email sent"),
});

// POST /auth/logout
authRegistry.registerPath({
	method: "post",
	path: "/auth/logout",
	tags: ["Authentication"],
	summary: "Logout user",
	security: [{ bearerAuth: [] }],
	responses: createApiResponse(z.object({ message: z.string() }), "User logged out successfully"),
});

// Routes
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/me", authenticateToken, authController.getCurrentUser);
authRouter.post("/change-password", authenticateToken, authController.changePassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/logout", authenticateToken, authController.logout);
