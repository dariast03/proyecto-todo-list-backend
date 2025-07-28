import { StatusCodes } from "http-status-codes";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { logger } from "@/server";
import type { CreateProject, GetProjectsQuery, ProjectMember, UpdateProject } from "./projectModel";
import { ProjectRepository } from "./projectRepository";

export class ProjectService {
	private projectRepository: ProjectRepository;

	constructor(repository: ProjectRepository = new ProjectRepository()) {
		this.projectRepository = repository;
	}

	// Create a new project
	async createProject(projectData: CreateProject, ownerId: number) {
		try {
			const project = await this.projectRepository.create({
				...projectData,
				ownerId,
			});

			// Get the full project details
			const projectWithDetails = await this.projectRepository.findById(project.id);

			return ServiceResponse.success("Project created successfully", projectWithDetails, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error creating project: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to create project", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get all projects with filters
	async getAllProjects(query: GetProjectsQuery) {
		try {
			const { projects, total } = await this.projectRepository.findMany(query);

			const response = {
				projects,
				pagination: {
					page: query.page,
					limit: query.limit,
					total,
					totalPages: Math.ceil(total / query.limit),
				},
			};

			return ServiceResponse.success("Projects retrieved successfully", response);
		} catch (error) {
			const errorMessage = `Error retrieving projects: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve projects", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get project by ID
	async getProjectById(id: number) {
		try {
			const project = await this.projectRepository.findById(id);

			if (!project) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.NOT_FOUND);
			}

			return ServiceResponse.success("Project retrieved successfully", project);
		} catch (error) {
			const errorMessage = `Error retrieving project: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve project", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update project
	async updateProject(id: number, updateData: UpdateProject, userId: number) {
		try {
			// Check if user has permission to update (owner or admin)
			const member = await this.projectRepository.isProjectMember(id, userId);
			if (!member || (member.role !== "owner" && member.role !== "admin")) {
				return ServiceResponse.failure("Insufficient permissions", null, StatusCodes.FORBIDDEN);
			}

			const updatedProject = await this.projectRepository.update(id, updateData);

			if (!updatedProject) {
				return ServiceResponse.failure("Project not found", null, StatusCodes.NOT_FOUND);
			}

			// Get the full project details
			const projectWithDetails = await this.projectRepository.findById(id);

			return ServiceResponse.success("Project updated successfully", projectWithDetails);
		} catch (error) {
			const errorMessage = `Error updating project: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update project", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Delete project
	async deleteProject(id: number, userId: number) {
		try {
			// Check if user is the project owner
			const member = await this.projectRepository.isProjectMember(id, userId);
			if (!member || member.role !== "owner") {
				return ServiceResponse.failure("Only project owner can delete project", null, StatusCodes.FORBIDDEN);
			}

			await this.projectRepository.delete(id);

			return ServiceResponse.success("Project deleted successfully", null);
		} catch (error) {
			const errorMessage = `Error deleting project: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to delete project", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Add members to project
	async addProjectMembers(projectId: number, members: ProjectMember[], userId: number) {
		try {
			// Check if user has permission (owner or admin)
			const member = await this.projectRepository.isProjectMember(projectId, userId);
			if (!member || (member.role !== "owner" && member.role !== "admin")) {
				return ServiceResponse.failure("Insufficient permissions", null, StatusCodes.FORBIDDEN);
			}

			const addedMembers = await this.projectRepository.addMembers(projectId, members);

			return ServiceResponse.success("Members added successfully", addedMembers, StatusCodes.CREATED);
		} catch (error) {
			const errorMessage = `Error adding project members: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to add project members", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Remove member from project
	async removeProjectMember(projectId: number, memberId: number, userId: number) {
		try {
			// Check if user has permission (owner or admin) or is removing themselves
			const userMember = await this.projectRepository.isProjectMember(projectId, userId);
			if (!userMember) {
				return ServiceResponse.failure("User is not a project member", null, StatusCodes.FORBIDDEN);
			}

			const canRemove = userMember.role === "owner" || userMember.role === "admin" || userId === memberId; // User can remove themselves

			if (!canRemove) {
				return ServiceResponse.failure("Insufficient permissions", null, StatusCodes.FORBIDDEN);
			}

			// Check if trying to remove the owner
			const memberToRemove = await this.projectRepository.isProjectMember(projectId, memberId);
			if (memberToRemove?.role === "owner" && userId !== memberId) {
				return ServiceResponse.failure("Cannot remove project owner", null, StatusCodes.FORBIDDEN);
			}

			await this.projectRepository.removeMember(projectId, memberId);

			return ServiceResponse.success("Member removed successfully", null);
		} catch (error) {
			const errorMessage = `Error removing project member: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to remove project member", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Update member role
	async updateMemberRole(projectId: number, memberId: number, newRole: string, userId: number) {
		try {
			// Check if user has permission (owner or admin)
			const userMember = await this.projectRepository.isProjectMember(projectId, userId);
			if (!userMember || (userMember.role !== "owner" && userMember.role !== "admin")) {
				return ServiceResponse.failure("Insufficient permissions", null, StatusCodes.FORBIDDEN);
			}

			// Only owner can change roles to/from owner
			if (newRole === "owner" || userMember.role === "owner") {
				if (userMember.role !== "owner") {
					return ServiceResponse.failure("Only owner can assign owner role", null, StatusCodes.FORBIDDEN);
				}
			}

			const updatedMember = await this.projectRepository.updateMemberRole(projectId, memberId, newRole);

			return ServiceResponse.success("Member role updated successfully", updatedMember);
		} catch (error) {
			const errorMessage = `Error updating member role: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to update member role", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	// Get user's projects
	async getUserProjects(userId: number) {
		try {
			const projects = await this.projectRepository.getUserProjects(userId);

			return ServiceResponse.success("User projects retrieved successfully", projects);
		} catch (error) {
			const errorMessage = `Error retrieving user projects: ${(error as Error).message}`;
			logger.error(errorMessage);
			return ServiceResponse.failure("Failed to retrieve user projects", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
