import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { projectMembersTable, projectsTable, tasksTable, usersTable } from "@/db/schema";
import { db } from "@/utils/db";
import type { CreateProject, GetProjectsQuery, ProjectMember, UpdateProject } from "./projectModel";

export class ProjectRepository {
	// Create a new project
	async create(projectData: CreateProject & { ownerId: number }) {
		return await db.transaction(async (tx) => {
			// Create project
			const [project] = await tx
				.insert(projectsTable)
				.values({
					...projectData,
					startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
					endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
				})
				.returning();

			// Add owner as project member
			await tx.insert(projectMembersTable).values({
				projectId: project.id,
				userId: project.ownerId,
				role: "owner",
			});

			// Add additional members if provided
			if (projectData.memberIds && projectData.memberIds.length > 0) {
				const memberData = projectData.memberIds.map((userId) => ({
					projectId: project.id,
					userId,
					role: "member" as const,
				}));
				await tx.insert(projectMembersTable).values(memberData);
			}

			return project;
		});
	}

	// Get all projects with filters
	async findMany(query: GetProjectsQuery) {
		const { status, priority, ownerId, memberId, search, page, limit } = query;
		const offset = (page - 1) * limit;

		const whereConditions = [];

		if (status) {
			whereConditions.push(eq(projectsTable.status, status));
		}
		if (priority) {
			whereConditions.push(eq(projectsTable.priority, priority));
		}
		if (ownerId) {
			whereConditions.push(eq(projectsTable.ownerId, ownerId));
		}
		if (search) {
			whereConditions.push(
				or(like(projectsTable.name, `%${search}%`), like(projectsTable.description, `%${search}%`)),
			);
		}
		if (memberId) {
			// Need to join with project_members table
			const memberProjects = await db
				.select({ projectId: projectMembersTable.projectId })
				.from(projectMembersTable)
				.where(eq(projectMembersTable.userId, memberId));

			const memberProjectIds = memberProjects.map((p) => p.projectId);
			if (memberProjectIds.length > 0) {
				whereConditions.push(sql`${projectsTable.id} IN ${memberProjectIds}`);
			} else {
				// No projects found for this member
				return { projects: [], total: 0 };
			}
		}

		const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

		// Get projects with owner details
		const projects = await db
			.select({
				id: projectsTable.id,
				name: projectsTable.name,
				description: projectsTable.description,
				status: projectsTable.status,
				priority: projectsTable.priority,
				startDate: projectsTable.startDate,
				endDate: projectsTable.endDate,
				ownerId: projectsTable.ownerId,
				createdAt: projectsTable.createdAt,
				updatedAt: projectsTable.updatedAt,
				owner: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					email: usersTable.email,
					avatar: usersTable.avatar,
				},
			})
			.from(projectsTable)
			.leftJoin(usersTable, eq(projectsTable.ownerId, usersTable.id))
			.where(whereClause)
			.orderBy(desc(projectsTable.createdAt))
			.limit(limit)
			.offset(offset);

		// Get total count
		const [{ total }] = await db.select({ total: count() }).from(projectsTable).where(whereClause);

		return { projects, total };
	}

	// Get project by ID with full details
	async findById(id: number) {
		const project = await db
			.select({
				id: projectsTable.id,
				name: projectsTable.name,
				description: projectsTable.description,
				status: projectsTable.status,
				priority: projectsTable.priority,
				startDate: projectsTable.startDate,
				endDate: projectsTable.endDate,
				ownerId: projectsTable.ownerId,
				createdAt: projectsTable.createdAt,
				updatedAt: projectsTable.updatedAt,
				owner: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					email: usersTable.email,
					avatar: usersTable.avatar,
				},
			})
			.from(projectsTable)
			.leftJoin(usersTable, eq(projectsTable.ownerId, usersTable.id))
			.where(eq(projectsTable.id, id))
			.limit(1);

		if (project.length === 0) return null;

		// Get project members
		const members = await db
			.select({
				id: projectMembersTable.id,
				userId: projectMembersTable.userId,
				role: projectMembersTable.role,
				joinedAt: projectMembersTable.joinedAt,
				user: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					email: usersTable.email,
					avatar: usersTable.avatar,
				},
			})
			.from(projectMembersTable)
			.leftJoin(usersTable, eq(projectMembersTable.userId, usersTable.id))
			.where(eq(projectMembersTable.projectId, id));

		// Get task counts
		const taskCounts = await db
			.select({
				total: count(),
				completed: count(sql`CASE WHEN ${tasksTable.completed} = true THEN 1 END`),
			})
			.from(tasksTable)
			.where(eq(tasksTable.projectId, id));

		return {
			...project[0],
			members,
			tasksCount: taskCounts[0]?.total || 0,
			completedTasksCount: taskCounts[0]?.completed || 0,
		};
	}

	// Update project
	async update(id: number, updateData: UpdateProject) {
		const [updated] = await db
			.update(projectsTable)
			.set({
				...updateData,
				startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
				endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
				updatedAt: new Date(),
			})
			.where(eq(projectsTable.id, id))
			.returning();

		return updated;
	}

	// Delete project
	async delete(id: number) {
		await db.transaction(async (tx) => {
			// Delete project members first
			await tx.delete(projectMembersTable).where(eq(projectMembersTable.projectId, id));
			// Delete project
			await tx.delete(projectsTable).where(eq(projectsTable.id, id));
		});
	}

	// Add members to project
	async addMembers(projectId: number, members: ProjectMember[]) {
		const memberData = members.map((member) => ({
			projectId,
			userId: member.userId,
			role: member.role,
		}));

		return await db.insert(projectMembersTable).values(memberData).returning();
	}

	// Remove member from project
	async removeMember(projectId: number, userId: number) {
		await db
			.delete(projectMembersTable)
			.where(and(eq(projectMembersTable.projectId, projectId), eq(projectMembersTable.userId, userId)));
	}

	// Update member role
	async updateMemberRole(projectId: number, userId: number, role: string) {
		const [updated] = await db
			.update(projectMembersTable)
			.set({ role })
			.where(and(eq(projectMembersTable.projectId, projectId), eq(projectMembersTable.userId, userId)))
			.returning();

		return updated;
	}

	// Check if user is project member
	async isProjectMember(projectId: number, userId: number) {
		const [member] = await db
			.select()
			.from(projectMembersTable)
			.where(and(eq(projectMembersTable.projectId, projectId), eq(projectMembersTable.userId, userId)))
			.limit(1);

		return member || null;
	}

	// Get user's projects
	async getUserProjects(userId: number) {
		return await db
			.select({
				id: projectsTable.id,
				name: projectsTable.name,
				description: projectsTable.description,
				status: projectsTable.status,
				priority: projectsTable.priority,
				startDate: projectsTable.startDate,
				endDate: projectsTable.endDate,
				ownerId: projectsTable.ownerId,
				createdAt: projectsTable.createdAt,
				updatedAt: projectsTable.updatedAt,
				memberRole: projectMembersTable.role,
			})
			.from(projectsTable)
			.innerJoin(projectMembersTable, eq(projectsTable.id, projectMembersTable.projectId))
			.where(eq(projectMembersTable.userId, userId))
			.orderBy(desc(projectsTable.createdAt));
	}
}
