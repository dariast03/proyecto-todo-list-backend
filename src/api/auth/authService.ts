import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type { ChangePassword, Login, Register } from "./authModel";
import { AuthRepository } from "./authRepository";

export class AuthService {
	private authRepository: AuthRepository;

	constructor(repository: AuthRepository = new AuthRepository()) {
		this.authRepository = repository;
	}

	// Register new user
	async register(userData: Register) {
		try {
			const result = await this.authRepository.register(userData);
			return ServiceResponse.success("User registered successfully", result, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error registering user: ${(error as Error).message}`;
			logger.error(errorMessage);

			if ((error as Error).message === "User already exists with this email") {
				return ServiceResponse.failure("User already exists with this email", null, StatusCodes.CONFLICT);
			}

			return ServiceResponse.failure("Failed to register user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Login user
	async login(credentials: Login) {
		try {
			const result = await this.authRepository.login(credentials);
			return ServiceResponse.success("Login successful", result);
		} catch (error) {
			const errorMessage = `Error logging in: ${(error as Error).message}`;
			logger.error(errorMessage);

			if ((error as Error).message === "Invalid email or password") {
				return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
			}

			return ServiceResponse.failure("Failed to login", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get current user
	async getCurrentUser(userId: number) {
		try {
			const user = await this.authRepository.getUserById(userId);

			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("User retrieved successfully", user);
		} catch (error) {
			const errorMessage = `Error retrieving user: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Change password
	async changePassword(userId: number, passwordData: ChangePassword) {
		try {
			await this.authRepository.changePassword(userId, passwordData.currentPassword, passwordData.newPassword);

			return ServiceResponse.success("Password changed successfully", null);
		} catch (error) {
			const errorMessage = `Error changing password: ${(error as Error).message}`;
			logger.error(errorMessage);

			if ((error as Error).message === "Current password is incorrect") {
				return ServiceResponse.failure("Current password is incorrect", null, StatusCodes.BAD_REQUEST);
			}

			if ((error as Error).message === "User not found") {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.failure("Failed to change password", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Reset password (placeholder - would typically send email)
	async resetPassword(email: string) {
		try {
			const user = await this.authRepository.findUserByEmail(email);

			if (!user) {
				// Don't reveal if email exists or not for security
				return ServiceResponse.success("If the email exists, a password reset link has been sent", null);
			}

			// Here you would typically send a password reset email
			// For now, just return success
			return ServiceResponse.success("If the email exists, a password reset link has been sent", null);
		} catch (error) {
			const errorMessage = `Error resetting password: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to reset password", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Verify token
	verifyToken(token: string) {
		try {
			return this.authRepository.verifyToken(token);
		} catch {
			throw new Error("Invalid token");
		}
	}
}
