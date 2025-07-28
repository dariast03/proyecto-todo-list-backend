import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type {
	CreateTask,
	CreateTaskAttachment,
	CreateTaskComment,
	GetTasksQuery,
	UpdateTask,
	UpdateTaskComment,
} from "./taskModel";
import { TaskRepository } from "./taskRepository";

export class TaskService {
	private taskRepository: TaskRepository;

	constructor(repository: TaskRepository = new TaskRepository()) {
		this.taskRepository = repository;
	}

	// Create a new task
	async createTask(taskData: CreateTask, createdById: number) {
		try {
			const task = await this.taskRepository.create({
				...taskData,
				createdById,
			});

			// Get the full task details
			const taskWithDetails = await this.taskRepository.findById(task.id);

			return ServiceResponse.success("Task created successfully", taskWithDetails, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating task: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create task", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get all tasks with filters
	async getAllTasks(query: GetTasksQuery) {
		try {
			const { tasks } = await this.taskRepository.findMany(query);

			return ServiceResponse.success("Tasks retrieved successfully", tasks);
		} catch (error) {
			const errorMessage = `Error retrieving tasks: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve tasks", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get task by ID
	async getTaskById(id: number) {
		try {
			const task = await this.taskRepository.findById(id);

			if (!task) {
				return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Task retrieved successfully", task);
		} catch (error) {
			const errorMessage = `Error retrieving task: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve task", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update task
	async updateTask(id: number, updateData: UpdateTask) {
		try {
			const updatedTask = await this.taskRepository.update(id, updateData);

			if (!updatedTask) {
				return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
			}

			// Get the full task details
			const taskWithDetails = await this.taskRepository.findById(id);

			return ServiceResponse.success("Task updated successfully", taskWithDetails);
		} catch (error) {
			const errorMessage = `Error updating task: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update task", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete task
	async deleteTask(id: number) {
		try {
			await this.taskRepository.delete(id);
			return ServiceResponse.success("Task deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting task: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete task", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Toggle task completion
	async toggleTaskComplete(id: number, completed: boolean) {
		try {
			const updatedTask = await this.taskRepository.toggleComplete(id, completed);

			if (!updatedTask) {
				return ServiceResponse.failure("Task not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success(`Task marked as ${completed ? "completed" : "pending"}`, updatedTask);
		} catch (error) {
			const errorMessage = `Error updating task completion: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update task completion", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get user's tasks
	async getUserTasks(userId: number, filters?: Partial<GetTasksQuery>) {
		try {
			const tasks = await this.taskRepository.getUserTasks(userId, filters);
			return ServiceResponse.success("User tasks retrieved successfully", tasks);
		} catch (error) {
			const errorMessage = `Error retrieving user tasks: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve user tasks", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Create task comment
	async createTaskComment(taskId: number, commentData: CreateTaskComment, userId: number) {
		try {
			const comment = await this.taskRepository.createComment({
				...commentData,
				taskId,
				userId,
			});

			return ServiceResponse.success("Comment created successfully", comment, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating comment: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create comment", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update task comment
	async updateTaskComment(commentId: number, updateData: UpdateTaskComment) {
		try {
			const updatedComment = await this.taskRepository.updateComment(commentId, updateData);

			if (!updatedComment) {
				return ServiceResponse.failure("Comment not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Comment updated successfully", updatedComment);
		} catch (error) {
			const errorMessage = `Error updating comment: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update comment", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete task comment
	async deleteTaskComment(commentId: number) {
		try {
			await this.taskRepository.deleteComment(commentId);
			return ServiceResponse.success("Comment deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting comment: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete comment", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Create task attachment
	async createTaskAttachment(taskId: number, attachmentData: CreateTaskAttachment, uploadedById: number) {
		try {
			const attachment = await this.taskRepository.createAttachment({
				...attachmentData,
				taskId,
				uploadedById,
			});

			return ServiceResponse.success("Attachment created successfully", attachment, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating attachment: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create attachment", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete task attachment
	async deleteTaskAttachment(attachmentId: number) {
		try {
			await this.taskRepository.deleteAttachment(attachmentId);
			return ServiceResponse.success("Attachment deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting attachment: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete attachment", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get overdue tasks
	async getOverdueTasks() {
		try {
			const tasks = await this.taskRepository.getOverdueTasks();
			return ServiceResponse.success("Overdue tasks retrieved successfully", tasks);
		} catch (error) {
			const errorMessage = `Error retrieving overdue tasks: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve overdue tasks", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
