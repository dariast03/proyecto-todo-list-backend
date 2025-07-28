import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../authService";

// Mock the AuthRepository
const mockAuthRepository = {
	register: vi.fn(),
	login: vi.fn(),
	getUserById: vi.fn(),
	changePassword: vi.fn(),
	findUserByEmail: vi.fn(),
	verifyToken: vi.fn(),
};

describe("AuthService", () => {
	let authService: AuthService;

	beforeEach(() => {
		vi.clearAllMocks();
		// @ts-expect-error - Using mock repository for testing
		authService = new AuthService(mockAuthRepository);
	});

	describe("register", () => {
		it("should register user successfully", async () => {
			const userData = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "securePassword123!",
				role: "member" as const,
			};

			const mockResult = {
				user: { id: 1, email: userData.email, firstName: userData.firstName, lastName: userData.lastName },
				token: "mock-jwt-token",
			};

			mockAuthRepository.register.mockResolvedValue(mockResult);

			const result = await authService.register(userData);

			expect(result.success).toBe(true);
			expect(result.statusCode).toBe(StatusCodes.CREATED);
			expect(result.data).toEqual(mockResult);
			expect(mockAuthRepository.register).toHaveBeenCalledWith(userData);
		});

		it("should handle duplicate email error", async () => {
			const userData = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "securePassword123!",
				role: "member" as const,
			};

			mockAuthRepository.register.mockRejectedValue(new Error("User already exists with this email"));

			const result = await authService.register(userData);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.CONFLICT);
			expect(result.message).toBe("User already exists with this email");
		});

		it("should handle generic registration error", async () => {
			const userData = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "securePassword123!",
				role: "member" as const,
			};

			mockAuthRepository.register.mockRejectedValue(new Error("Database connection failed"));

			const result = await authService.register(userData);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.message).toBe("Failed to register user");
		});
	});

	describe("login", () => {
		it("should login successfully", async () => {
			const credentials = {
				email: "john.doe@example.com",
				password: "securePassword123!",
			};

			const mockResult = {
				user: { id: 1, email: credentials.email, firstName: "John", lastName: "Doe" },
				token: "mock-jwt-token",
			};

			mockAuthRepository.login.mockResolvedValue(mockResult);

			const result = await authService.login(credentials);

			expect(result.success).toBe(true);
			expect(result.statusCode).toBe(StatusCodes.OK);
			expect(result.data).toEqual(mockResult);
			expect(mockAuthRepository.login).toHaveBeenCalledWith(credentials);
		});

		it("should handle invalid credentials", async () => {
			const credentials = {
				email: "john.doe@example.com",
				password: "wrongPassword",
			};

			mockAuthRepository.login.mockRejectedValue(new Error("Invalid email or password"));

			const result = await authService.login(credentials);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.UNAUTHORIZED);
			expect(result.message).toBe("Invalid email or password");
		});
	});

	describe("getCurrentUser", () => {
		it("should get current user successfully", async () => {
			const userId = 1;
			const mockUser = {
				id: userId,
				email: "john.doe@example.com",
				firstName: "John",
				lastName: "Doe",
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			mockAuthRepository.getUserById.mockResolvedValue(mockUser);

			const result = await authService.getCurrentUser(userId);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockUser);
			expect(mockAuthRepository.getUserById).toHaveBeenCalledWith(userId);
		});

		it("should handle user not found", async () => {
			const userId = 999;

			mockAuthRepository.getUserById.mockResolvedValue(null);

			const result = await authService.getCurrentUser(userId);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.NOT_FOUND);
			expect(result.message).toBe("User not found");
		});
	});

	describe("changePassword", () => {
		it("should change password successfully", async () => {
			const userId = 1;
			const passwordData = {
				currentPassword: "oldPassword123!",
				newPassword: "newPassword123!",
			};

			mockAuthRepository.changePassword.mockResolvedValue(undefined);

			const result = await authService.changePassword(userId, passwordData);

			expect(result.success).toBe(true);
			expect(result.message).toBe("Password changed successfully");
			expect(mockAuthRepository.changePassword).toHaveBeenCalledWith(
				userId,
				passwordData.currentPassword,
				passwordData.newPassword,
			);
		});

		it("should handle incorrect current password", async () => {
			const userId = 1;
			const passwordData = {
				currentPassword: "wrongPassword",
				newPassword: "newPassword123!",
			};

			mockAuthRepository.changePassword.mockRejectedValue(new Error("Current password is incorrect"));

			const result = await authService.changePassword(userId, passwordData);

			expect(result.success).toBe(false);
			expect(result.statusCode).toBe(StatusCodes.BAD_REQUEST);
			expect(result.message).toBe("Current password is incorrect");
		});
	});

	describe("resetPassword", () => {
		it("should handle password reset for existing email", async () => {
			const email = "john.doe@example.com";
			const mockUser = { id: 1, email };

			mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);

			const result = await authService.resetPassword(email);

			expect(result.success).toBe(true);
			expect(result.message).toBe("If the email exists, a password reset link has been sent");
		});

		it("should handle password reset for non-existent email", async () => {
			const email = "nonexistent@example.com";

			mockAuthRepository.findUserByEmail.mockResolvedValue(null);

			const result = await authService.resetPassword(email);

			expect(result.success).toBe(true);
			expect(result.message).toBe("If the email exists, a password reset link has been sent");
		});
	});

	describe("verifyToken", () => {
		it("should verify valid token", () => {
			const token = "valid-jwt-token";
			const mockPayload = { id: 1, email: "john.doe@example.com" };

			mockAuthRepository.verifyToken.mockReturnValue(mockPayload);

			const result = authService.verifyToken(token);

			expect(result).toEqual(mockPayload);
			expect(mockAuthRepository.verifyToken).toHaveBeenCalledWith(token);
		});

		it("should throw error for invalid token", () => {
			const token = "invalid-token";

			mockAuthRepository.verifyToken.mockImplementation(() => {
				throw new Error("Token verification failed");
			});

			expect(() => authService.verifyToken(token)).toThrow("Invalid token");
		});
	});
});
