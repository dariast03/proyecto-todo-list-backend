import { and, count, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { categoriesTable, tasksTable } from "@/db/schema";
import { db } from "@/utils/db";
import type { CreateCategory, GetCategoriesQuery, UpdateCategory } from "./categoryModel";

export class CategoryRepository {
	// Create a new category
	async create(categoryData: CreateCategory & { userId?: number }) {
		const [category] = await db
			.insert(categoriesTable)
			.values({
				...categoryData,
				userId: categoryData.isGlobal ? null : categoryData.userId,
			})
			.returning();

		return category;
	}

	// Get all categories with filters
	async findMany(query: GetCategoriesQuery) {
		const { userId, includeGlobal, search } = query;
		const whereConditions = [];

		if (search) {
			whereConditions.push(
				or(like(categoriesTable.name, `%${search}%`), like(categoriesTable.description, `%${search}%`)),
			);
		}

		// Build user/global filter
		if (userId && includeGlobal) {
			// Get user's categories and global categories
			whereConditions.push(or(eq(categoriesTable.userId, userId), isNull(categoriesTable.userId)));
		} else if (userId) {
			// Get only user's categories
			whereConditions.push(eq(categoriesTable.userId, userId));
		} else if (includeGlobal) {
			// Get only global categories
			whereConditions.push(isNull(categoriesTable.userId));
		}

		const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

		// Get categories with task counts
		const categories = await db
			.select({
				id: categoriesTable.id,
				name: categoriesTable.name,
				color: categoriesTable.color,
				description: categoriesTable.description,
				userId: categoriesTable.userId,
				createdAt: categoriesTable.createdAt,
				taskCount: count(tasksTable.id),
				completedTaskCount: count(sql`CASE WHEN ${tasksTable.completed} = true THEN 1 END`),
			})
			.from(categoriesTable)
			.leftJoin(tasksTable, eq(categoriesTable.id, tasksTable.categoryId))
			.where(whereClause)
			.groupBy(categoriesTable.id)
			.orderBy(desc(categoriesTable.createdAt));

		return categories;
	}

	// Get category by ID
	async findById(id: number) {
		const category = await db
			.select({
				id: categoriesTable.id,
				name: categoriesTable.name,
				color: categoriesTable.color,
				description: categoriesTable.description,
				userId: categoriesTable.userId,
				createdAt: categoriesTable.createdAt,
				taskCount: count(tasksTable.id),
				completedTaskCount: count(sql`CASE WHEN ${tasksTable.completed} = true THEN 1 END`),
			})
			.from(categoriesTable)
			.leftJoin(tasksTable, eq(categoriesTable.id, tasksTable.categoryId))
			.where(eq(categoriesTable.id, id))
			.groupBy(categoriesTable.id)
			.limit(1);

		return category[0] || null;
	}

	// Update category
	async update(id: number, updateData: UpdateCategory) {
		const [updated] = await db
			.update(categoriesTable)
			.set(updateData)
			.where(eq(categoriesTable.id, id))
			.returning();

		return updated;
	}

	// Delete category
	async delete(id: number) {
		await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
	}

	// Get global categories
	async getGlobalCategories() {
		return await db
			.select({
				id: categoriesTable.id,
				name: categoriesTable.name,
				color: categoriesTable.color,
				description: categoriesTable.description,
				userId: categoriesTable.userId,
				createdAt: categoriesTable.createdAt,
			})
			.from(categoriesTable)
			.where(isNull(categoriesTable.userId))
			.orderBy(categoriesTable.name);
	}

	// Get user's categories
	async getUserCategories(userId: number) {
		return await db
			.select({
				id: categoriesTable.id,
				name: categoriesTable.name,
				color: categoriesTable.color,
				description: categoriesTable.description,
				userId: categoriesTable.userId,
				createdAt: categoriesTable.createdAt,
				taskCount: count(tasksTable.id),
				completedTaskCount: count(sql`CASE WHEN ${tasksTable.completed} = true THEN 1 END`),
			})
			.from(categoriesTable)
			.leftJoin(tasksTable, eq(categoriesTable.id, tasksTable.categoryId))
			.where(eq(categoriesTable.userId, userId))
			.groupBy(categoriesTable.id)
			.orderBy(categoriesTable.name);
	}

	// Check if user owns category
	async isOwner(categoryId: number, userId: number) {
		const [category] = await db
			.select({ userId: categoriesTable.userId })
			.from(categoriesTable)
			.where(eq(categoriesTable.id, categoryId))
			.limit(1);

		return category && category.userId === userId;
	}

	// Check if category is global
	async isGlobal(categoryId: number) {
		const [category] = await db
			.select({ userId: categoriesTable.userId })
			.from(categoriesTable)
			.where(eq(categoriesTable.id, categoryId))
			.limit(1);

		return category && category.userId === null;
	}
}
