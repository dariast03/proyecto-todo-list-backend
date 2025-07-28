import bcrypt from "bcryptjs";
import {
	categoriesTable,
	projectMembersTable,
	projectsTable,
	taskAttachmentsTable,
	taskCommentsTable,
	tasksTable,
	usersTable,
} from "@/db/schema";
import { db } from "@/utils/db";

export async function seedDatabase() {
	try {
		console.log("🌱 Starting database seeding...");

		// Clear existing data (in reverse order to avoid foreign key constraints)
		console.log("🧹 Cleaning existing data...");
		await db.delete(taskAttachmentsTable);
		await db.delete(taskCommentsTable);
		await db.delete(tasksTable);
		await db.delete(projectMembersTable);
		await db.delete(projectsTable);
		await db.delete(categoriesTable);
		await db.delete(usersTable);

		// 1. Seed Users
		console.log("👥 Seeding users...");
		const hashedPassword = await bcrypt.hash("password123", 10);

		const users = await db
			.insert(usersTable)
			.values([
				{
					firstName: "Admin",
					lastName: "User",
					email: "admin@example.com",
					password: hashedPassword,
					role: "admin",
					avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
					isActive: true,
				},
				{
					firstName: "John",
					lastName: "Doe",
					email: "john.doe@example.com",
					password: hashedPassword,
					role: "project_manager",
					avatar: "https://ui-avatars.com/api/?name=John+Doe&background=7C3AED&color=fff",
					isActive: true,
				},
				{
					firstName: "Jane",
					lastName: "Smith",
					email: "jane.smith@example.com",
					password: hashedPassword,
					role: "member",
					avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=EC4899&color=fff",
					isActive: true,
				},
				{
					firstName: "Bob",
					lastName: "Johnson",
					email: "bob.johnson@example.com",
					password: hashedPassword,
					role: "member",
					avatar: "https://ui-avatars.com/api/?name=Bob+Johnson&background=10B981&color=fff",
					isActive: true,
				},
				{
					firstName: "Alice",
					lastName: "Wilson",
					email: "alice.wilson@example.com",
					password: hashedPassword,
					role: "member",
					avatar: "https://ui-avatars.com/api/?name=Alice+Wilson&background=F59E0B&color=fff",
					isActive: true,
				},
			])
			.returning();

		console.log(`✅ Created ${users.length} users`);

		// 2. Seed Categories
		console.log("📂 Seeding categories...");
		const categories = await db
			.insert(categoriesTable)
			.values([
				// Global categories
				{
					name: "Frontend",
					color: "#3B82F6",
					description: "Frontend development tasks",
					userId: null,
				},
				{
					name: "Backend",
					color: "#EF4444",
					description: "Backend development tasks",
					userId: null,
				},
				{
					name: "Design",
					color: "#8B5CF6",
					description: "UI/UX design tasks",
					userId: null,
				},
				{
					name: "Testing",
					color: "#10B981",
					description: "Testing and QA tasks",
					userId: null,
				},
				{
					name: "DevOps",
					color: "#F59E0B",
					description: "DevOps and deployment tasks",
					userId: null,
				},
				// Personal categories for users
				{
					name: "Personal",
					color: "#EC4899",
					description: "Personal tasks",
					userId: users[1].id, // John's personal category
				},
				{
					name: "Learning",
					color: "#06B6D4",
					description: "Learning and development",
					userId: users[2].id, // Jane's learning category
				},
			])
			.returning();

		console.log(`✅ Created ${categories.length} categories`);

		// 3. Seed Projects
		console.log("🚀 Seeding projects...");
		const projects = await db
			.insert(projectsTable)
			.values([
				{
					name: "E-commerce Platform",
					description: "Building a modern e-commerce platform with React and Node.js",
					status: "active",
					priority: "high",
					startDate: new Date("2024-01-15"),
					endDate: new Date("2024-06-30"),
					ownerId: users[1].id, // John Doe
				},
				{
					name: "Mobile Banking App",
					description: "Secure mobile banking application for iOS and Android",
					status: "active",
					priority: "urgent",
					startDate: new Date("2024-02-01"),
					endDate: new Date("2024-08-15"),
					ownerId: users[0].id, // Admin User
				},
				{
					name: "Internal CRM System",
					description: "Customer relationship management system for internal use",
					status: "active",
					priority: "medium",
					startDate: new Date("2024-03-01"),
					endDate: new Date("2024-09-30"),
					ownerId: users[1].id, // John Doe
				},
				{
					name: "Marketing Website",
					description: "Company marketing website redesign",
					status: "completed",
					priority: "low",
					startDate: new Date("2023-11-01"),
					endDate: new Date("2024-01-31"),
					ownerId: users[2].id, // Jane Smith
				},
				{
					name: "Analytics Dashboard",
					description: "Real-time analytics dashboard for business metrics",
					status: "archived",
					priority: "medium",
					startDate: new Date("2023-09-01"),
					endDate: new Date("2023-12-31"),
					ownerId: users[0].id, // Admin User
				},
			])
			.returning();

		console.log(`✅ Created ${projects.length} projects`);

		// 4. Seed Project Members
		console.log("👥 Seeding project members...");
		const projectMembers = await db
			.insert(projectMembersTable)
			.values([
				// E-commerce Platform members
				{ projectId: projects[0].id, userId: users[1].id, role: "owner" },
				{ projectId: projects[0].id, userId: users[2].id, role: "admin" },
				{ projectId: projects[0].id, userId: users[3].id, role: "member" },
				{ projectId: projects[0].id, userId: users[4].id, role: "member" },

				// Mobile Banking App members
				{ projectId: projects[1].id, userId: users[0].id, role: "owner" },
				{ projectId: projects[1].id, userId: users[1].id, role: "admin" },
				{ projectId: projects[1].id, userId: users[2].id, role: "member" },

				// Internal CRM System members
				{ projectId: projects[2].id, userId: users[1].id, role: "owner" },
				{ projectId: projects[2].id, userId: users[3].id, role: "member" },
				{ projectId: projects[2].id, userId: users[4].id, role: "member" },

				// Marketing Website members
				{ projectId: projects[3].id, userId: users[2].id, role: "owner" },
				{ projectId: projects[3].id, userId: users[4].id, role: "member" },

				// Analytics Dashboard members
				{ projectId: projects[4].id, userId: users[0].id, role: "owner" },
				{ projectId: projects[4].id, userId: users[1].id, role: "member" },
			])
			.returning();

		console.log(`✅ Created ${projectMembers.length} project memberships`);

		// 5. Seed Tasks
		console.log("📋 Seeding tasks...");
		const tasks = await db
			.insert(tasksTable)
			.values([
				// E-commerce Platform tasks
				{
					title: "Setup project structure",
					description: "Initialize the project with proper folder structure and dependencies",
					status: "completed",
					priority: "high",
					dueDate: new Date("2024-01-20"),
					completed: true,
					projectId: projects[0].id,
					categoryId: categories[1].id, // Backend
					assignedToId: users[1].id,
					createdById: users[1].id,
				},
				{
					title: "Design user authentication flow",
					description: "Create wireframes and user flow for authentication system",
					status: "completed",
					priority: "high",
					dueDate: new Date("2024-01-25"),
					completed: true,
					projectId: projects[0].id,
					categoryId: categories[2].id, // Design
					assignedToId: users[2].id,
					createdById: users[1].id,
				},
				{
					title: "Implement product catalog",
					description: "Build the product catalog with search and filtering capabilities",
					status: "in_progress",
					priority: "medium",
					dueDate: new Date("2024-07-15"),
					completed: false,
					projectId: projects[0].id,
					categoryId: categories[0].id, // Frontend
					assignedToId: users[3].id,
					createdById: users[1].id,
				},
				{
					title: "Payment gateway integration",
					description: "Integrate Stripe payment gateway for secure transactions",
					status: "todo",
					priority: "high",
					dueDate: new Date("2024-08-01"),
					completed: false,
					projectId: projects[0].id,
					categoryId: categories[1].id, // Backend
					assignedToId: users[4].id,
					createdById: users[1].id,
				},

				// Mobile Banking App tasks
				{
					title: "Security audit",
					description: "Conduct comprehensive security audit of the application",
					status: "in_progress",
					priority: "urgent",
					dueDate: new Date("2024-07-30"),
					completed: false,
					projectId: projects[1].id,
					categoryId: categories[3].id, // Testing
					assignedToId: users[1].id,
					createdById: users[0].id,
				},
				{
					title: "Biometric authentication",
					description: "Implement fingerprint and face recognition authentication",
					status: "todo",
					priority: "high",
					dueDate: new Date("2024-08-15"),
					completed: false,
					projectId: projects[1].id,
					categoryId: categories[1].id, // Backend
					assignedToId: users[2].id,
					createdById: users[0].id,
				},

				// Internal CRM System tasks
				{
					title: "Customer data migration",
					description: "Migrate existing customer data to the new CRM system",
					status: "todo",
					priority: "medium",
					dueDate: new Date("2024-08-30"),
					completed: false,
					projectId: projects[2].id,
					categoryId: categories[1].id, // Backend
					assignedToId: users[3].id,
					createdById: users[1].id,
				},
				{
					title: "Reports dashboard",
					description: "Create interactive reports and analytics dashboard",
					status: "todo",
					priority: "low",
					dueDate: new Date("2024-09-15"),
					completed: false,
					projectId: projects[2].id,
					categoryId: categories[0].id, // Frontend
					assignedToId: users[4].id,
					createdById: users[1].id,
				},

				// Marketing Website tasks (completed project)
				{
					title: "Homepage redesign",
					description: "Complete redesign of the company homepage",
					status: "completed",
					priority: "high",
					dueDate: new Date("2024-01-15"),
					completed: true,
					projectId: projects[3].id,
					categoryId: categories[2].id, // Design
					assignedToId: users[2].id,
					createdById: users[2].id,
				},
				{
					title: "SEO optimization",
					description: "Optimize website for search engines",
					status: "completed",
					priority: "medium",
					dueDate: new Date("2024-01-30"),
					completed: true,
					projectId: projects[3].id,
					categoryId: categories[0].id, // Frontend
					assignedToId: users[4].id,
					createdById: users[2].id,
				},
			])
			.returning();

		console.log(`✅ Created ${tasks.length} tasks`);

		// 6. Seed Task Comments
		console.log("💬 Seeding task comments...");
		const taskComments = await db
			.insert(taskCommentsTable)
			.values([
				{
					content: "Great work on the project setup! The structure looks clean and well-organized.",
					taskId: tasks[0].id,
					userId: users[2].id,
				},
				{
					content: "I've reviewed the authentication flow design. Looks good to proceed with implementation.",
					taskId: tasks[1].id,
					userId: users[1].id,
				},
				{
					content: "Working on the search functionality. Should have it ready by end of week.",
					taskId: tasks[2].id,
					userId: users[3].id,
				},
				{
					content: "Need clarification on the payment flow requirements. Can we schedule a quick meeting?",
					taskId: tasks[3].id,
					userId: users[4].id,
				},
				{
					content: "Security audit is progressing well. Found a few minor issues that need addressing.",
					taskId: tasks[4].id,
					userId: users[1].id,
				},
				{
					content:
						"The biometric integration looks complex. Might need additional time to implement properly.",
					taskId: tasks[5].id,
					userId: users[2].id,
				},
			])
			.returning();

		console.log(`✅ Created ${taskComments.length} task comments`);

		// 7. Seed Task Attachments
		console.log("📎 Seeding task attachments...");
		const taskAttachments = await db
			.insert(taskAttachmentsTable)
			.values([
				{
					fileName: "ecommerce-project-structure.zip",
					fileUrl: "/uploads/attachments/project-structure.zip",
					mimeType: "application/zip",
					fileSize: 2048576, // 2MB
					taskId: tasks[0].id,
					uploadedById: users[1].id,
				},
				{
					fileName: "authentication-wireframes.pdf",
					fileUrl: "/uploads/attachments/auth-wireframes.pdf",
					mimeType: "application/pdf",
					fileSize: 1536000, // 1.5MB
					taskId: tasks[1].id,
					uploadedById: users[2].id,
				},
				{
					fileName: "product-catalog-mockup.png",
					fileUrl: "/uploads/attachments/catalog-mockup.png",
					mimeType: "image/png",
					fileSize: 3145728, // 3MB
					taskId: tasks[2].id,
					uploadedById: users[3].id,
				},
				{
					fileName: "stripe-integration-docs.pdf",
					fileUrl: "/uploads/attachments/payment-flow.pdf",
					mimeType: "application/pdf",
					fileSize: 512000, // 500KB
					taskId: tasks[3].id,
					uploadedById: users[4].id,
				},
				{
					fileName: "security-audit-report.docx",
					fileUrl: "/uploads/attachments/security-report.docx",
					mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					fileSize: 1024000, // 1MB
					taskId: tasks[4].id,
					uploadedById: users[1].id,
				},
			])
			.returning();

		console.log(`✅ Created ${taskAttachments.length} task attachments`);

		// Summary
		console.log("\n🎉 Database seeding completed successfully!");
		console.log("📊 Summary:");
		console.log(`   👥 Users: ${users.length}`);
		console.log(`   📂 Categories: ${categories.length}`);
		console.log(`   🚀 Projects: ${projects.length}`);
		console.log(`   👥 Project Members: ${projectMembers.length}`);
		console.log(`   📋 Tasks: ${tasks.length}`);
		console.log(`   💬 Comments: ${taskComments.length}`);
		console.log(`   📎 Attachments: ${taskAttachments.length}`);
		console.log("\n🔑 Default login credentials:");
		console.log("   Admin: admin@example.com / password123");
		console.log("   Manager: john.doe@example.com / password123");
		console.log("   Member: jane.smith@example.com / password123");

		return {
			users,
			categories,
			projects,
			projectMembers,
			tasks,
			taskComments,
			taskAttachments,
		};
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		throw error;
	}
}

// Run seeding if this file is executed directly
if (require.main === module) {
	seedDatabase()
		.then(() => {
			console.log("✅ Seeding completed");
			process.exit(0);
		})
		.catch((error) => {
			console.error("❌ Seeding failed:", error);
			process.exit(1);
		});
}
