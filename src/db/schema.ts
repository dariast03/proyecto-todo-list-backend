import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users table
export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	firstName: varchar({ length: 255 }).notNull(),
	lastName: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).notNull().default("member"), // admin, project_manager, member
	avatar: varchar({ length: 500 }),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

// Projects table
export const projectsTable = pgTable("projects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).notNull().default("active"), // active, completed, archived
	priority: varchar({ length: 20 }).notNull().default("medium"), // low, medium, high, urgent
	startDate: timestamp(),
	endDate: timestamp(),
	ownerId: integer().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

// Project members (many-to-many relationship)
export const projectMembersTable = pgTable("project_members", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	projectId: integer().notNull(),
	userId: integer().notNull(),
	role: varchar({ length: 50 }).notNull().default("member"), // owner, admin, member
	joinedAt: timestamp().defaultNow().notNull(),
});

// Categories table
export const categoriesTable = pgTable("categories", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 100 }).notNull(),
	color: varchar({ length: 7 }).notNull().default("#3B82F6"), // hex color
	description: text(),
	userId: integer(), // null for global categories, user id for personal categories
	createdAt: timestamp().defaultNow().notNull(),
});

// Tasks table
export const tasksTable = pgTable("tasks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
	priority: varchar({ length: 20 }).notNull().default("medium"), // low, medium, high, urgent
	completed: boolean().notNull().default(false),
	dueDate: timestamp(),
	reminderDate: timestamp(),
	estimatedHours: integer(),
	actualHours: integer(),
	projectId: integer(), // null for personal tasks
	categoryId: integer(),
	assignedToId: integer(), // user assigned to the task
	createdById: integer().notNull(), // user who created the task
	parentTaskId: integer(), // for subtasks
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

// Task comments table
export const taskCommentsTable = pgTable("task_comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	content: text().notNull(),
	taskId: integer().notNull(),
	userId: integer().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

// Project comments table
export const projectCommentsTable = pgTable("project_comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	content: text().notNull(),
	projectId: integer().notNull(),
	userId: integer().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp().defaultNow().notNull(),
});

// Task attachments table
export const taskAttachmentsTable = pgTable("task_attachments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	fileName: varchar({ length: 255 }).notNull(),
	fileUrl: varchar({ length: 500 }).notNull(),
	fileSize: integer(),
	mimeType: varchar({ length: 100 }),
	taskId: integer().notNull(),
	uploadedById: integer().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
	ownedProjects: many(projectsTable),
	projectMemberships: many(projectMembersTable),
	assignedTasks: many(tasksTable, { relationName: "assignedTasks" }),
	createdTasks: many(tasksTable, { relationName: "createdTasks" }),
	taskComments: many(taskCommentsTable),
	projectComments: many(projectCommentsTable),
	categories: many(categoriesTable),
	taskAttachments: many(taskAttachmentsTable),
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
	owner: one(usersTable, {
		fields: [projectsTable.ownerId],
		references: [usersTable.id],
	}),
	members: many(projectMembersTable),
	tasks: many(tasksTable),
	comments: many(projectCommentsTable),
}));

export const projectMembersRelations = relations(projectMembersTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [projectMembersTable.projectId],
		references: [projectsTable.id],
	}),
	user: one(usersTable, {
		fields: [projectMembersTable.userId],
		references: [usersTable.id],
	}),
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [categoriesTable.userId],
		references: [usersTable.id],
	}),
	tasks: many(tasksTable),
}));

export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
	project: one(projectsTable, {
		fields: [tasksTable.projectId],
		references: [projectsTable.id],
	}),
	category: one(categoriesTable, {
		fields: [tasksTable.categoryId],
		references: [categoriesTable.id],
	}),
	assignedTo: one(usersTable, {
		fields: [tasksTable.assignedToId],
		references: [usersTable.id],
		relationName: "assignedTasks",
	}),
	createdBy: one(usersTable, {
		fields: [tasksTable.createdById],
		references: [usersTable.id],
		relationName: "createdTasks",
	}),
	parentTask: one(tasksTable, {
		fields: [tasksTable.parentTaskId],
		references: [tasksTable.id],
		relationName: "parentTask",
	}),
	subtasks: many(tasksTable, { relationName: "parentTask" }),
	comments: many(taskCommentsTable),
	attachments: many(taskAttachmentsTable),
}));

export const taskCommentsRelations = relations(taskCommentsTable, ({ one }) => ({
	task: one(tasksTable, {
		fields: [taskCommentsTable.taskId],
		references: [tasksTable.id],
	}),
	user: one(usersTable, {
		fields: [taskCommentsTable.userId],
		references: [usersTable.id],
	}),
}));

export const projectCommentsRelations = relations(projectCommentsTable, ({ one }) => ({
	project: one(projectsTable, {
		fields: [projectCommentsTable.projectId],
		references: [projectsTable.id],
	}),
	user: one(usersTable, {
		fields: [projectCommentsTable.userId],
		references: [usersTable.id],
	}),
}));

export const taskAttachmentsRelations = relations(taskAttachmentsTable, ({ one }) => ({
	task: one(tasksTable, {
		fields: [taskAttachmentsTable.taskId],
		references: [tasksTable.id],
	}),
	uploadedBy: one(usersTable, {
		fields: [taskAttachmentsTable.uploadedById],
		references: [usersTable.id],
	}),
}));
