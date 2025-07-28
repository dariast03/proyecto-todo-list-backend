import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type { CreateCategory, GetCategoriesQuery, UpdateCategory } from "./categoryModel";
import { CategoryRepository } from "./categoryRepository";

export class CategoryService {
	private categoryRepository: CategoryRepository;

	constructor(repository: CategoryRepository = new CategoryRepository()) {
		this.categoryRepository = repository;
	}

	// Create a new category
	async createCategory(categoryData: CreateCategory, userId: number) {
		try {
			const category = await this.categoryRepository.create({
				...categoryData,
				userId: categoryData.isGlobal ? undefined : userId,
			});

			return ServiceResponse.success("Category created successfully", category, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating category: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create category", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get all categories with filters
	async getAllCategories(query: GetCategoriesQuery) {
		try {
			const categories = await this.categoryRepository.findMany(query);
			return ServiceResponse.success("Categories retrieved successfully", categories);
		} catch (error) {
			const errorMessage = `Error retrieving categories: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve categories", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get category by ID
	async getCategoryById(id: number) {
		try {
			const category = await this.categoryRepository.findById(id);

			if (!category) {
				return ServiceResponse.failure("Category not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Category retrieved successfully", category);
		} catch (error) {
			const errorMessage = `Error retrieving category: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve category", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update category
	async updateCategory(id: number, updateData: UpdateCategory, userId: number) {
		try {
			// Check if user owns the category or if it's a global category (admin only)
			const isOwner = await this.categoryRepository.isOwner(id, userId);
			const isGlobal = await this.categoryRepository.isGlobal(id);

			if (!isOwner && isGlobal) {
				return ServiceResponse.failure("Only admins can update global categories", null, StatusCodes.FORBIDDEN);
			}

			if (!isOwner && !isGlobal) {
				return ServiceResponse.failure("You can only update your own categories", null, StatusCodes.FORBIDDEN);
			}

			const updatedCategory = await this.categoryRepository.update(id, updateData);

			if (!updatedCategory) {
				return ServiceResponse.failure("Category not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Category updated successfully", updatedCategory);
		} catch (error) {
			const errorMessage = `Error updating category: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update category", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete category
	async deleteCategory(id: number, userId: number) {
		try {
			// Check if user owns the category or if it's a global category (admin only)
			const isOwner = await this.categoryRepository.isOwner(id, userId);
			const isGlobal = await this.categoryRepository.isGlobal(id);

			if (!isOwner && isGlobal) {
				return ServiceResponse.failure("Only admins can delete global categories", null, StatusCodes.FORBIDDEN);
			}

			if (!isOwner && !isGlobal) {
				return ServiceResponse.failure("You can only delete your own categories", null, StatusCodes.FORBIDDEN);
			}

			await this.categoryRepository.delete(id);

			return ServiceResponse.success("Category deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting category: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete category", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get global categories
	async getGlobalCategories() {
		try {
			const categories = await this.categoryRepository.getGlobalCategories();
			return ServiceResponse.success("Global categories retrieved successfully", categories);
		} catch (error) {
			const errorMessage = `Error retrieving global categories: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"Failed to retrieve global categories",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}

	// Get user's categories
	async getUserCategories(userId: number) {
		try {
			const categories = await this.categoryRepository.getUserCategories(userId);
			return ServiceResponse.success("User categories retrieved successfully", categories);
		} catch (error) {
			const errorMessage = `Error retrieving user categories: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure(
				"Failed to retrieve user categories",
				null,
				StatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
