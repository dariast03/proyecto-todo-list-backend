import type { Request, RequestHandler, Response } from "express";

import { userService } from "@/api/user/userService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { CreateUserSchema, GetUsersQuerySchema, UpdateUserSchema } from "./userModel";

class UserController {
	// Create a new user
	public createUser: RequestHandler = async (req: Request, res: Response) => {
		const body = CreateUserSchema.parse(req.body);
		const serviceResponse = await userService.createUser(body);
		handleServiceResponse(serviceResponse, res);
	};

	// Get all users with filters
	public getUsers: RequestHandler = async (req: Request, res: Response) => {
		const query = GetUsersQuerySchema.parse(req.query);
		const serviceResponse = await userService.getAllUsers(query);
		handleServiceResponse(serviceResponse, res);
	};

	// Get user by ID
	public getUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.getUserById(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Get user profile with stats
	public getUserProfile: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.getUserProfile(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Get current user profile
	public getMyProfile: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.id || 1; // Default to user 1 for now
		const serviceResponse = await userService.getUserProfile(userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Update user
	public updateUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const body = UpdateUserSchema.parse(req.body);
		const serviceResponse = await userService.updateUser(id, body);
		handleServiceResponse(serviceResponse, res);
	};

	// Delete user
	public deleteUser: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const serviceResponse = await userService.deleteUser(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Get all users simple (for dropdowns)
	public getUsersSimple: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await userService.getAllUsersSimple();
		handleServiceResponse(serviceResponse, res);
	};
}

export const userController = new UserController();
