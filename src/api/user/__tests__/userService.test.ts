import { StatusCodes } from "http-status-codes";
import type { Mock } from "vitest";

import type { User } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { UserService } from "@/api/user/userService";

vi.mock("@/api/user/userRepository");

describe("userService", () => {
	let userServiceInstance: UserService;
	let userRepositoryInstance: UserRepository;

	const mockUsers: User[] = [
		{
			id: 1,
			firstName: "Alice",
			lastName: "Johnson",
			email: "alice@example.com",
			role: "admin",
			avatar: "https://example.com/avatar1.jpg",
			isActive: true,
			createdAt: "2024-01-01T00:00:00Z",
			updatedAt: "2024-01-01T00:00:00Z",
		},
		{
			id: 2,
			firstName: "Bob",
			lastName: "Smith",
			email: "bob@example.com",
			role: "member",
			isActive: true,
			createdAt: "2024-01-02T00:00:00Z",
			updatedAt: "2024-01-02T00:00:00Z",
		},
	];

	beforeEach(() => {
		userRepositoryInstance = new UserRepository();
		userServiceInstance = new UserService(userRepositoryInstance);
	});

	describe("findAll", () => {
		it("should return all users", async () => {
			// Arrange
			const query = { page: 1, limit: 10 };
			const mockResponse = { users: mockUsers, total: mockUsers.length };
			(userRepositoryInstance.findMany as Mock).mockReturnValue(mockResponse);

			// Act
			const result = await userServiceInstance.getAllUsers(query);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.message).toContain("Users retrieved successfully");
			expect(result.data).not.toBeNull();
			expect(result.data?.users).toEqual(mockUsers);
		});

		it("should handle repository returning null", async () => {
			// Arrange
			const query = { page: 1, limit: 10 };
			(userRepositoryInstance.findMany as Mock).mockReturnValue({ users: [], total: 0 });

			// Act
			const result = await userServiceInstance.getAllUsers(query);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.data).not.toBeNull();
			expect(result.data?.users).toEqual([]);
		});

		it("should handle errors for findAll", async () => {
			// Arrange
			const query = { page: 1, limit: 10 };
			(userRepositoryInstance.findMany as Mock).mockRejectedValue(new Error("Database error"));

			// Act
			const result = await userServiceInstance.getAllUsers(query);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.message).toContain("Failed to retrieve users");
		});
	});

	describe("findById", () => {
		it("returns a user for a valid ID", async () => {
			// Arrange
			const testId = 1;
			const mockUser = mockUsers.find((user) => user.id === testId);
			(userRepositoryInstance.findById as Mock).mockReturnValue(mockUser);

			// Act
			const result = await userServiceInstance.getUserById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.OK);
			expect(result.success).toBeTruthy();
			expect(result.message).toContain("User retrieved successfully");
			expect(result.data).toEqual(mockUser);
		});

		it("handles errors for findById", async () => {
			// Arrange
			const testId = 1;
			(userRepositoryInstance.findById as Mock).mockRejectedValue(new Error("Database error"));

			// Act
			const result = await userServiceInstance.getUserById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
			expect(result.success).toBeFalsy();
			expect(result.message).toContain("Failed to retrieve user");
			expect(result.data).toBeNull();
		});

		it("returns a not found error for non-existent ID", async () => {
			// Arrange
			const testId = 1;
			(userRepositoryInstance.findById as Mock).mockReturnValue(null);

			// Act
			const result = await userServiceInstance.getUserById(testId);

			// Assert
			expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(result.success).toBeFalsy();
			expect(result.message).toContain("User not found");
			expect(result.data).toBeNull();
		});
	});
});
