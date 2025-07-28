import { Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { categoryController } from "./categoryController";
import { CreateCategorySchema, GetCategoriesQuerySchema, UpdateCategorySchema } from "./categoryModel";

// Export the registry for OpenAPI
export { categoryRegistry } from "./categoryOpenApiRegistry";

const categoryRouter: Router = Router();

// Create category
categoryRouter.post("/", validateRequest(CreateCategorySchema), categoryController.createCategory);

// Get all categories with filters
categoryRouter.get("/", validateRequest(GetCategoriesQuerySchema), categoryController.getCategories);

// Get global categories
categoryRouter.get("/global", categoryController.getGlobalCategories);

// Get user's categories
categoryRouter.get("/my-categories", categoryController.getUserCategories);

// Get category by ID
categoryRouter.get("/:id", categoryController.getCategory);

// Update category
categoryRouter.put("/:id", validateRequest(UpdateCategorySchema), categoryController.updateCategory);

// Delete category
categoryRouter.delete("/:id", categoryController.deleteCategory);

export { categoryRouter };
