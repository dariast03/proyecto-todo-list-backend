import { StatusCodes } from "http-status-codes";

import type { CreateUser, GetUsersQuery, UpdateUser } from "@/api/user/userModel";
import { UserRepository } from "@/api/user/userRepository";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";

export class UserService {
	private userRepository: UserRepository;

	constructor(repository: UserRepository = new UserRepository()) {
		this.userRepository = repository;
	}

	// Create a new user
	async createUser(userData: CreateUser) {
		try {
			// Check if email already exists
			const existingUser = await this.userRepository.findByEmail(userData.email);
			if (existingUser) {
				return ServiceResponse.failure("Email already exists", null, StatusCodes.CONFLICT);
			}

			const user = await this.userRepository.create(userData);
			return ServiceResponse.success("User created successfully", user, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating user: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get all users with filters
	async getAllUsers(query: GetUsersQuery) {
		try {
			const { users } = await this.userRepository.findMany(query);

			return ServiceResponse.success("Users retrieved successfully", users);
		} catch (error) {
			const errorMessage = `Error retrieving users: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve users", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get user by ID
	async getUserById(id: number) {
		try {
			const user = await this.userRepository.findById(id);
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

	// Get user profile with stats
	async getUserProfile(id: number) {
		try {
			const userProfile = await this.userRepository.findProfileById(id);
			if (!userProfile) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}
			return ServiceResponse.success("User profile retrieved successfully", userProfile);
		} catch (error) {
			const errorMessage = `Error retrieving user profile: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve user profile", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update user
	async updateUser(id: number, updateData: UpdateUser) {
		try {
			// Check if email is being updated and already exists
			if (updateData.email) {
				const existingUser = await this.userRepository.findByEmail(updateData.email);
				if (existingUser && existingUser.id !== id) {
					return ServiceResponse.failure("Email already exists", null, StatusCodes.CONFLICT);
				}
			}

			const updatedUser = await this.userRepository.update(id, updateData);
			if (!updatedUser) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("User updated successfully", updatedUser);
		} catch (error) {
			const errorMessage = `Error updating user: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete user
	async deleteUser(id: number) {
		try {
			const user = await this.userRepository.findById(id);
			if (!user) {
				return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
			}

			await this.userRepository.delete(id);
			return ServiceResponse.success("User deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting user: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete user", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get all users (for dropdowns)
	async getAllUsersSimple() {
		try {
			const users = await this.userRepository.findAll();
			return ServiceResponse.success("Users retrieved successfully", users);
		} catch (error) {
			const errorMessage = `Error retrieving users: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve users", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export const userService = new UserService();
