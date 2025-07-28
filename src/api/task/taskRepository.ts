import { and, asc, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import {
	categoriesTable,
	projectsTable,
	taskAttachmentsTable,
	taskCommentsTable,
	tasksTable,
	usersTable,
} from "@/db/schema";
import { db } from "@/utils/db";
import type {
	CreateTask,
	CreateTaskAttachment,
	CreateTaskComment,
	GetTasksQuery,
	UpdateTask,
	UpdateTaskComment,
} from "./taskModel";

export class TaskRepository {
	// Create a new task
	async create(taskData: CreateTask & { createdById: number }) {
		const [task] = await db
			.insert(tasksTable)
			.values({
				...taskData,
				dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
				reminderDate: taskData.reminderDate ? new Date(taskData.reminderDate) : undefined,
			})
			.returning();

		return task;
	}

	// Get all tasks with filters
	async findMany(query: GetTasksQuery) {
		const {
			status,
			priority,
			completed,
			projectId,
			categoryId,
			assignedToId,
			createdById,
			dueDate,
			search,
			includeSubtasks,
			sortBy,
			sortOrder,
		} = query;

		const whereConditions = [];

		if (status) {
			whereConditions.push(eq(tasksTable.status, status));
		}
		if (priority) {
			whereConditions.push(eq(tasksTable.priority, priority));
		}
		if (completed !== undefined) {
			whereConditions.push(eq(tasksTable.completed, completed));
		}
		if (projectId) {
			whereConditions.push(eq(tasksTable.projectId, projectId));
		}
		if (categoryId) {
			whereConditions.push(eq(tasksTable.categoryId, categoryId));
		}
		if (assignedToId) {
			whereConditions.push(eq(tasksTable.assignedToId, assignedToId));
		}
		if (createdById) {
			whereConditions.push(eq(tasksTable.createdById, createdById));
		}
		if (search) {
			whereConditions.push(
				or(like(tasksTable.title, `%${search}%`), like(tasksTable.description, `%${search}%`)),
			);
		}
		if (!includeSubtasks) {
			whereConditions.push(sql`${tasksTable.parentTaskId} IS NULL`);
		}
		if (dueDate) {
			// Assume dueDate is in format YYYY-MM-DD
			const startDate = new Date(dueDate);
			const endDate = new Date(dueDate);
			endDate.setDate(endDate.getDate() + 1);

			whereConditions.push(and(gte(tasksTable.dueDate, startDate), lte(tasksTable.dueDate, endDate)));
		}

		const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

		// Determine sort column and order
		const sortColumn =
			sortBy === "createdAt"
				? tasksTable.createdAt
				: sortBy === "dueDate"
					? tasksTable.dueDate
					: sortBy === "priority"
						? tasksTable.priority
						: tasksTable.title;

		const orderByClause = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

		// Get tasks with relations
		const tasks = await db
			.select({
				id: tasksTable.id,
				title: tasksTable.title,
				description: tasksTable.description,
				status: tasksTable.status,
				priority: tasksTable.priority,
				completed: tasksTable.completed,
				dueDate: tasksTable.dueDate,
				reminderDate: tasksTable.reminderDate,
				estimatedHours: tasksTable.estimatedHours,
				actualHours: tasksTable.actualHours,
				projectId: tasksTable.projectId,
				categoryId: tasksTable.categoryId,
				assignedToId: tasksTable.assignedToId,
				createdById: tasksTable.createdById,
				parentTaskId: tasksTable.parentTaskId,
				createdAt: tasksTable.createdAt,
				updatedAt: tasksTable.updatedAt,
				project: {
					id: projectsTable.id,
					name: projectsTable.name,
					status: projectsTable.status,
				},
				category: {
					id: categoriesTable.id,
					name: categoriesTable.name,
					color: categoriesTable.color,
				},
				assignedTo: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					email: usersTable.email,
					avatar: usersTable.avatar,
				},
			})
			.from(tasksTable)
			.leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
			.leftJoin(categoriesTable, eq(tasksTable.categoryId, categoriesTable.id))
			.leftJoin(usersTable, eq(tasksTable.assignedToId, usersTable.id))
			.where(whereClause)
			.orderBy(orderByClause);

		return { tasks };
	}

	// Get task by ID with full details
	async findById(id: number) {
		const task = await db
			.select({
				id: tasksTable.id,
				title: tasksTable.title,
				description: tasksTable.description,
				status: tasksTable.status,
				priority: tasksTable.priority,
				completed: tasksTable.completed,
				dueDate: tasksTable.dueDate,
				reminderDate: tasksTable.reminderDate,
				estimatedHours: tasksTable.estimatedHours,
				actualHours: tasksTable.actualHours,
				projectId: tasksTable.projectId,
				categoryId: tasksTable.categoryId,
				assignedToId: tasksTable.assignedToId,
				createdById: tasksTable.createdById,
				parentTaskId: tasksTable.parentTaskId,
				createdAt: tasksTable.createdAt,
				updatedAt: tasksTable.updatedAt,
			})
			.from(tasksTable)
			.where(eq(tasksTable.id, id))
			.limit(1);

		if (task.length === 0) return null;

		// Get relations
		const project = task[0].projectId
			? await db
					.select({
						id: projectsTable.id,
						name: projectsTable.name,
						status: projectsTable.status,
					})
					.from(projectsTable)
					.where(eq(projectsTable.id, task[0].projectId))
					.limit(1)
			: [];

		const category = task[0].categoryId
			? await db
					.select({
						id: categoriesTable.id,
						name: categoriesTable.name,
						color: categoriesTable.color,
					})
					.from(categoriesTable)
					.where(eq(categoriesTable.id, task[0].categoryId))
					.limit(1)
			: [];

		const assignedTo = task[0].assignedToId
			? await db
					.select({
						id: usersTable.id,
						name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
						email: usersTable.email,
						avatar: usersTable.avatar,
					})
					.from(usersTable)
					.where(eq(usersTable.id, task[0].assignedToId))
					.limit(1)
			: [];

		const createdBy = await db
			.select({
				id: usersTable.id,
				name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
				email: usersTable.email,
				avatar: usersTable.avatar,
			})
			.from(usersTable)
			.where(eq(usersTable.id, task[0].createdById))
			.limit(1);

		const parentTask = task[0].parentTaskId
			? await db
					.select({
						id: tasksTable.id,
						title: tasksTable.title,
						status: tasksTable.status,
					})
					.from(tasksTable)
					.where(eq(tasksTable.id, task[0].parentTaskId))
					.limit(1)
			: [];

		// Get subtasks
		const subtasks = await db
			.select({
				id: tasksTable.id,
				title: tasksTable.title,
				status: tasksTable.status,
				completed: tasksTable.completed,
				assignedTo: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
				},
			})
			.from(tasksTable)
			.leftJoin(usersTable, eq(tasksTable.assignedToId, usersTable.id))
			.where(eq(tasksTable.parentTaskId, id));

		// Get comments
		const comments = await db
			.select({
				id: taskCommentsTable.id,
				content: taskCommentsTable.content,
				taskId: taskCommentsTable.taskId,
				userId: taskCommentsTable.userId,
				createdAt: taskCommentsTable.createdAt,
				updatedAt: taskCommentsTable.updatedAt,
				user: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					avatar: usersTable.avatar,
				},
			})
			.from(taskCommentsTable)
			.leftJoin(usersTable, eq(taskCommentsTable.userId, usersTable.id))
			.where(eq(taskCommentsTable.taskId, id))
			.orderBy(desc(taskCommentsTable.createdAt));

		// Get attachments
		const attachments = await db
			.select({
				id: taskAttachmentsTable.id,
				fileName: taskAttachmentsTable.fileName,
				fileUrl: taskAttachmentsTable.fileUrl,
				fileSize: taskAttachmentsTable.fileSize,
				mimeType: taskAttachmentsTable.mimeType,
				taskId: taskAttachmentsTable.taskId,
				uploadedById: taskAttachmentsTable.uploadedById,
				createdAt: taskAttachmentsTable.createdAt,
				uploadedBy: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
				},
			})
			.from(taskAttachmentsTable)
			.leftJoin(usersTable, eq(taskAttachmentsTable.uploadedById, usersTable.id))
			.where(eq(taskAttachmentsTable.taskId, id))
			.orderBy(desc(taskAttachmentsTable.createdAt));

		return {
			...task[0],
			project: project[0] || null,
			category: category[0] || null,
			assignedTo: assignedTo[0] || null,
			createdBy: createdBy[0],
			parentTask: parentTask[0] || null,
			subtasks,
			comments,
			attachments,
		};
	}

	// Update task
	async update(id: number, updateData: UpdateTask) {
		const [updated] = await db
			.update(tasksTable)
			.set({
				...updateData,
				dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
				reminderDate: updateData.reminderDate ? new Date(updateData.reminderDate) : undefined,
				updatedAt: new Date(),
			})
			.where(eq(tasksTable.id, id))
			.returning();

		return updated;
	}

	// Delete task
	async delete(id: number) {
		await db.transaction(async (tx) => {
			// Delete comments and attachments first
			await tx.delete(taskCommentsTable).where(eq(taskCommentsTable.taskId, id));
			await tx.delete(taskAttachmentsTable).where(eq(taskAttachmentsTable.taskId, id));
			// Delete task
			await tx.delete(tasksTable).where(eq(tasksTable.id, id));
		});
	}

	// Mark task as completed/uncompleted
	async toggleComplete(id: number, completed: boolean) {
		const [updated] = await db
			.update(tasksTable)
			.set({
				completed,
				status: completed ? "completed" : "pending",
				updatedAt: new Date(),
			})
			.where(eq(tasksTable.id, id))
			.returning();

		return updated;
	}

	// Get user's tasks
	async getUserTasks(userId: number, filters?: Partial<GetTasksQuery>) {
		const whereConditions = [or(eq(tasksTable.assignedToId, userId), eq(tasksTable.createdById, userId))];

		if (filters?.status) {
			whereConditions.push(eq(tasksTable.status, filters.status));
		}
		if (filters?.priority) {
			whereConditions.push(eq(tasksTable.priority, filters.priority));
		}
		if (filters?.completed !== undefined) {
			whereConditions.push(eq(tasksTable.completed, filters.completed));
		}

		return await db
			.select({
				id: tasksTable.id,
				title: tasksTable.title,
				description: tasksTable.description,
				status: tasksTable.status,
				priority: tasksTable.priority,
				completed: tasksTable.completed,
				dueDate: tasksTable.dueDate,
				reminderDate: tasksTable.reminderDate,
				estimatedHours: tasksTable.estimatedHours,
				actualHours: tasksTable.actualHours,
				projectId: tasksTable.projectId,
				categoryId: tasksTable.categoryId,
				assignedToId: tasksTable.assignedToId,
				createdById: tasksTable.createdById,
				parentTaskId: tasksTable.parentTaskId,
				createdAt: tasksTable.createdAt,
				updatedAt: tasksTable.updatedAt,
				project: {
					id: projectsTable.id,
					name: projectsTable.name,
				},
				category: {
					id: categoriesTable.id,
					name: categoriesTable.name,
					color: categoriesTable.color,
				},
			})
			.from(tasksTable)
			.leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
			.leftJoin(categoriesTable, eq(tasksTable.categoryId, categoriesTable.id))
			.where(and(...whereConditions))
			.orderBy(desc(tasksTable.createdAt));
	}

	// Comment methods
	async createComment(commentData: CreateTaskComment & { taskId: number; userId: number }) {
		const [comment] = await db.insert(taskCommentsTable).values(commentData).returning();

		return comment;
	}

	async updateComment(commentId: number, updateData: UpdateTaskComment) {
		const [updated] = await db
			.update(taskCommentsTable)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(taskCommentsTable.id, commentId))
			.returning();

		return updated;
	}

	async deleteComment(commentId: number) {
		await db.delete(taskCommentsTable).where(eq(taskCommentsTable.id, commentId));
	}

	// Attachment methods
	async createAttachment(attachmentData: CreateTaskAttachment & { taskId: number; uploadedById: number }) {
		const [attachment] = await db.insert(taskAttachmentsTable).values(attachmentData).returning();

		return attachment;
	}

	async deleteAttachment(attachmentId: number) {
		await db.delete(taskAttachmentsTable).where(eq(taskAttachmentsTable.id, attachmentId));
	}

	// Get overdue tasks
	async getOverdueTasks() {
		const now = new Date();

		return await db
			.select({
				id: tasksTable.id,
				title: tasksTable.title,
				dueDate: tasksTable.dueDate,
				priority: tasksTable.priority,
				assignedTo: {
					id: usersTable.id,
					name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
					email: usersTable.email,
				},
				project: {
					id: projectsTable.id,
					name: projectsTable.name,
				},
			})
			.from(tasksTable)
			.leftJoin(usersTable, eq(tasksTable.assignedToId, usersTable.id))
			.leftJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
			.where(and(eq(tasksTable.completed, false), sql`${tasksTable.dueDate} < ${now}`))
			.orderBy(asc(tasksTable.dueDate));
	}
}
