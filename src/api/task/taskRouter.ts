import { Router } from "express";
import { validateRequest } from "@/common/utils/httpHandlers";
import { taskController } from "./taskController";
import {
	CreateTaskAttachmentSchema,
	CreateTaskCommentSchema,
	CreateTaskSchema,
	GetTasksQuerySchema,
	UpdateTaskCommentSchema,
	UpdateTaskSchema,
} from "./taskModel";

// Export the registry for OpenAPI
export { taskRegistry } from "./taskOpenApiRegistry";

const taskRouter: Router = Router();

// Create task
taskRouter.post("/", validateRequest(CreateTaskSchema), taskController.createTask);

// Get all tasks with filters
taskRouter.get("/", validateRequest(GetTasksQuerySchema), taskController.getTasks);

// Get user's tasks
taskRouter.get("/my-tasks", taskController.getUserTasks);

// Get overdue tasks
taskRouter.get("/overdue", taskController.getOverdueTasks);

// Get task by ID
taskRouter.get("/:id", taskController.getTask);

// Update task
taskRouter.put("/:id", validateRequest(UpdateTaskSchema), taskController.updateTask);

// Delete task
taskRouter.delete("/:id", taskController.deleteTask);

// Toggle task completion
taskRouter.patch("/:id/toggle-complete", taskController.toggleTaskComplete);

// Task comments
taskRouter.post("/:id/comments", validateRequest(CreateTaskCommentSchema), taskController.createTaskComment);

taskRouter.put("/:id/comments/:commentId", validateRequest(UpdateTaskCommentSchema), taskController.updateTaskComment);

taskRouter.delete("/:id/comments/:commentId", taskController.deleteTaskComment);

// Task attachments
taskRouter.post("/:id/attachments", validateRequest(CreateTaskAttachmentSchema), taskController.createTaskAttachment);

taskRouter.delete("/:id/attachments/:attachmentId", taskController.deleteTaskAttachment);

export { taskRouter };
