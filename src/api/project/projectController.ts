import type { Request, RequestHandler, Response } from "express";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import {
	AddProjectMembersSchema,
	CreateProjectSchema,
	GetProjectsQuerySchema,
	UpdateMemberRoleSchema,
	UpdateProjectSchema,
} from "./projectModel";
import { ProjectService } from "./projectService";

class ProjectController {
	private projectService: ProjectService;

	constructor(service: ProjectService = new ProjectService()) {
		this.projectService = service;
	}

	// Create a new project
	public createProject: RequestHandler = async (req: Request, res: Response) => {
		const body = CreateProjectSchema.parse(req.body);
		const ownerId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.createProject(body, ownerId);
		handleServiceResponse(serviceResponse, res);
	};

	// Get all projects with filters
	public getProjects: RequestHandler = async (req: Request, res: Response) => {
		const query = GetProjectsQuerySchema.parse(req.query);

		const serviceResponse = await this.projectService.getAllProjects(query);
		handleServiceResponse(serviceResponse, res);
	};

	// Get project by ID
	public getProject: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);

		const serviceResponse = await this.projectService.getProjectById(id);
		handleServiceResponse(serviceResponse, res);
	};

	// Update project
	public updateProject: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		console.log("🚀 ~ ProjectController ~ req.body:", req.body);
		const body = UpdateProjectSchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.updateProject(id, body, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Delete project
	public deleteProject: RequestHandler = async (req: Request, res: Response) => {
		const id = Number.parseInt(req.params.id as string, 10);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.deleteProject(id, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Add project members
	public addProjectMembers: RequestHandler = async (req: Request, res: Response) => {
		const projectId = Number.parseInt(req.params.id as string, 10);
		const body = AddProjectMembersSchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.addProjectMembers(projectId, body.members, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Remove project member
	public removeProjectMember: RequestHandler = async (req: Request, res: Response) => {
		const projectId = Number.parseInt(req.params.id as string, 10);
		const memberId = Number.parseInt(req.params.memberId as string, 10);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.removeProjectMember(projectId, memberId, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Update member role
	public updateMemberRole: RequestHandler = async (req: Request, res: Response) => {
		const projectId = Number.parseInt(req.params.id as string, 10);
		const memberId = Number.parseInt(req.params.memberId as string, 10);
		const body = UpdateMemberRoleSchema.parse(req.body);
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.updateMemberRole(projectId, memberId, body.role, userId);
		handleServiceResponse(serviceResponse, res);
	};

	// Get user projects
	public getUserProjects: RequestHandler = async (req: Request, res: Response) => {
		const userId = req.user?.id || 1; // Default to user 1 for now

		const serviceResponse = await this.projectService.getUserProjects(userId);
		handleServiceResponse(serviceResponse, res);
	};
}

export const projectController = new ProjectController();
