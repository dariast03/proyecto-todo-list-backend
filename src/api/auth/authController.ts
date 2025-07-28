import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { ChangePasswordSchema, LoginSchema, RegisterSchema } from "./authModel";
import { AuthService } from "./authService";

class AuthController {
	private authService: AuthService;

	constructor(service: AuthService = new AuthService()) {
		this.authService = service;
	}

	public register: RequestHandler = async (req: Request, res: Response) => {
		try {
			const userData = RegisterSchema.parse(req.body);
			const serviceResponse = await this.authService.register(userData);
			return handleServiceResponse(serviceResponse, res);
		} catch {
			return res.status(400).json({ error: "Invalid request data" });
		}
	};

	public login: RequestHandler = async (req: Request, res: Response) => {
		try {
			const credentials = LoginSchema.parse(req.body);
			const serviceResponse = await this.authService.login(credentials);
			return handleServiceResponse(serviceResponse, res);
		} catch {
			return res.status(400).json({ error: "Invalid request data" });
		}
	};

	public getCurrentUser: RequestHandler = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const serviceResponse = await this.authService.getCurrentUser(userId);
			return handleServiceResponse(serviceResponse, res);
		} catch {
			return res.status(500).json({ error: "Internal server error" });
		}
	};

	public changePassword: RequestHandler = async (req: Request, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			const passwordData = ChangePasswordSchema.parse(req.body);
			const serviceResponse = await this.authService.changePassword(userId, passwordData);
			return handleServiceResponse(serviceResponse, res);
		} catch {
			return res.status(400).json({ error: "Invalid request data" });
		}
	};

	public resetPassword: RequestHandler = async (req: Request, res: Response) => {
		try {
			const { email } = req.body;

			if (!email) {
				return res.status(400).json({ error: "Email is required" });
			}

			const serviceResponse = await this.authService.resetPassword(email);
			return handleServiceResponse(serviceResponse, res);
		} catch {
			return res.status(500).json({ error: "Internal server error" });
		}
	};

	public logout: RequestHandler = async (_req: Request, res: Response) => {
		try {
			// For JWT tokens, logout is typically handled on the client side
			// by removing the token from storage. Server-side blacklisting
			// could be implemented for enhanced security.
			return res.status(200).json({ message: "Logout successful" });
		} catch {
			return res.status(500).json({ error: "Internal server error" });
		}
	};
}

export const authController = new AuthController();
