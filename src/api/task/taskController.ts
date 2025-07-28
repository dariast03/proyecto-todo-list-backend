import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import {
	CreateTaskAttachmentSchema,
	CreateTaskCommentSchema,
	CreateTaskSchema,
	GetTasksQuerySchema,
	UpdateTaskCommentSchema,
	UpdateTaskSchema,
} from "./taskModel";
import { TaskService } from "./taskService";

class TaskController {
	private taskService: TaskService;

	constructor(service: TaskService = new TaskService()) {
		this.taskService = service;
	}

	// Create a new task
	public createTask: RequestHandler = async (req: Request, res: Response) => {
		const body = CreateTaskSchema.parse(req.body);
		const createdById = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.taskService.createTask(body, createdById);
		handleServiceResponse(serviceResponse, res);
	};

	// Get all tasks with filters
	public getTasks: RequestHandler = async (req: Request, res: Response) => {
		const query = GetTasksQuerySchema.parse(req.query);

		const serviceResponse = await this.taskService.getAllTasks(query);
		handleServiceResponse(serviceResponse, res);
	};

	// Get task by ID
	public getTask: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);

		const serviceResponse = await this.taskService.getTaskById(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Update task
	public updateTask: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const body = UpdateTaskSchema.parse(req.body);

		const serviceResponse = await this.taskService.updateTask(id, body);
		handleServiceResponse(serviceResponse, res);
	};

	// Delete task
	public deleteTask: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);

		const serviceResponse = await this.taskService.deleteTask(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Toggle task completion
	public toggleTaskComplete: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const { completed } = req.body;

		const serviceResponse = await this.taskService.toggleTaskComplete(id, Boolean(completed));
		handleServiceResponse(serviceResponse, res);
	};

	// Get user's tasks
	public getUserTasks: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.id || 1; // Default to user 1 for now
		const filters = req.query as Record<string, unknown>;

		const serviceResponse = await this.taskService.getUserTasks(userId, filters);
		handleServiceResponse(serviceResponse, res);
	};

	// Get overdue tasks
	public getOverdueTasks: RequestHandler = async (_req: Request, res: Response) => {
		const serviceResponse = await this.taskService.getOverdueTasks();
		handleServiceResponse(serviceResponse, res);
	};

	// Task comments
	public createTaskComment: RequestHandler = async (req: Request, res: Response) => {
		const taskId = Number.parseInt(req.params.id as string, 10);
		const body = CreateTaskCommentSchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.taskService.createTaskComment(taskId, body, userId);
		handleServiceResponse(serviceResponse, res);
	};

	public updateTaskComment: RequestHandler = async (req: Request, res: Response) => {
		const commentId = Number.parseInt(req.params.commentId as string, 10);
		const body = UpdateTaskCommentSchema.parse(req.body);

		const serviceResponse = await this.taskService.updateTaskComment(commentId, body);
		handleServiceResponse(serviceResponse, res);
	};

	public deleteTaskComment: RequestHandler = async (req: Request, res: Response) => {
		const commentId = Number.parseInt(req.params.commentId as string, 10);

		const serviceResponse = await this.taskService.deleteTaskComment(commentId);
		handleServiceResponse(serviceResponse, res);
	};

	// Task attachments
	public createTaskAttachment: RequestHandler = async (req: Request, res: Response) => {
		const taskId = Number.parseInt(req.params.id as string, 10);
		const body = CreateTaskAttachmentSchema.parse(req.body);
		const uploadedById = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.taskService.createTaskAttachment(taskId, body, uploadedById);
		handleServiceResponse(serviceResponse, res);
	};

	public deleteTaskAttachment: RequestHandler = async (req: Request, res: Response) => {
		const attachmentId = Number.parseInt(req.params.attachmentId as string, 10);

		const serviceResponse = await this.taskService.deleteTaskAttachment(attachmentId);
		handleServiceResponse(serviceResponse, res);
	};
}

export const taskController = new TaskController();
