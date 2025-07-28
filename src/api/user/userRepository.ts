import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import type { CreateUser, GetUsersQuery, UpdateUser } from "@/api/user/userModel";
import { projectMembersTable, tasksTable, usersTable } from "@/db/schema";
import { db } from "@/utils/db";

export class UserRepository {
	// Get all users with filters
	async findMany(query: GetUsersQuery) {
		const { role, search } = query;
		const whereConditions = [];

		if (role) {
			whereConditions.push(eq(usersTable.role, role));
		}
		if (search) {
			whereConditions.push(
				or(
					like(usersTable.firstName, `%${search}%`),
					like(usersTable.lastName, `%${search}%`),
					like(usersTable.email, `%${search}%`),
				),
			);
		}

		const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

		const users = await db.select().from(usersTable).where(whereClause).orderBy(desc(usersTable.createdAt));

		return { users };
	}

	// Get user by ID
	async findById(id: number) {
		const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

		return user || null;
	}

	// Get user profile with stats
	async findProfileById(id: number) {
		const user = await this.findById(id);
		if (!user) return null;

		// Get user stats
		const projectsCount = await db
			.select({ count: count() })
			.from(projectMembersTable)
			.where(eq(projectMembersTable.userId, id));

		const tasksCount = await db
			.select({ count: count() })
			.from(tasksTable)
			.where(or(eq(tasksTable.assignedToId, id), eq(tasksTable.createdById, id)));

		const completedTasksCount = await db
			.select({ count: count() })
			.from(tasksTable)
			.where(
				and(
					eq(tasksTable.completed, true),
					or(eq(tasksTable.assignedToId, id), eq(tasksTable.createdById, id)),
				),
			);

		return {
			...user,
			projectsCount: projectsCount[0]?.count || 0,
			tasksCount: tasksCount[0]?.count || 0,
			completedTasksCount: completedTasksCount[0]?.count || 0,
		};
	}

	// Create user
	async create(userData: CreateUser) {
		const [user] = await db.insert(usersTable).values(userData).returning();

		return user;
	}

	// Update user
	async update(id: number, updateData: UpdateUser) {
		const [updated] = await db
			.update(usersTable)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(usersTable.id, id))
			.returning();

		return updated;
	}

	// Delete user
	async delete(id: number) {
		await db.delete(usersTable).where(eq(usersTable.id, id));
	}

	// Find user by email
	async findByEmail(email: string) {
		const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

		return user || null;
	}

	// Get all users (for dropdowns, etc.)
	async findAll() {
		return await db
			.select({
				id: usersTable.id,
				name: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`.as("name"),
				email: usersTable.email,
				role: usersTable.role,
				avatar: usersTable.avatar,
			})
			.from(usersTable)
			.where(eq(usersTable.isActive, true))
			.orderBy(usersTable.firstName, usersTable.lastName);
	}
}
