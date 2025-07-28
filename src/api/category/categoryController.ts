import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { CreateCategorySchema, GetCategoriesQuerySchema, UpdateCategorySchema } from "./categoryModel";
import { CategoryService } from "./categoryService";

class CategoryController {
	private categoryService: CategoryService;

	constructor(service: CategoryService = new CategoryService()) {
		this.categoryService = service;
	}

	// Create a new category
	public createCategory: RequestHandler = async (req: Request, res: Response) => {
		const body = CreateCategorySchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.categoryService.createCategory(body, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Get all categories with filters
	public getCategories: RequestHandler = async (req: Request, res: Response) => {
		const query = GetCategoriesQuerySchema.parse(req.query);

		const serviceResponse = await this.categoryService.getAllCategories(query);
		handleServiceResponse(serviceResponse, res);
	};

	// Get category by ID
	public getCategory: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);

		const serviceResponse = await this.categoryService.getCategoryById(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Update category
	public updateCategory: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const body = UpdateCategorySchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.categoryService.updateCategory(id, body, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Delete category
	public deleteCategory: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.categoryService.deleteCategory(id, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Get global categories
	public getGlobalCategories: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await this.categoryService.getGlobalCategories();
		handleServiceResponse(serviceResponse, res);
	};

	// Get user's categories
	public getUserCategories: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.categoryService.getUserCategories(userId);
		handleServiceResponse(serviceResponse, res);
	};
}

export const categoryController = new CategoryController();
