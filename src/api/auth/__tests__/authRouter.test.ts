import { eq } from "drizzle-orm";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { usersTable } from "@/db/schema";
import { app } from "@/server";
import { db } from "@/utils/db";

describe("Auth API", () => {
	let testUserId: number;
	let authToken: string;

	beforeAll(async () => {
		// Clean up existing test users - delete all for fresh start
		await db.delete(usersTable);
	});

	afterAll(async () => {
		// Clean up test data
		if (testUserId) {
			await db.delete(usersTable).where(eq(usersTable.id, testUserId));
		}
	});

	describe("POST /auth/register", () => {
		it("should register a new user successfully", async () => {
			const userData = {
				firstName: "John",
				lastName: "Doe",
				email: "john.doe@example.com",
				password: "securePassword123!",
			};

			const response = await request(app).post("/auth/register").send(userData);

			expect(response.status).toBe(201);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("token");
			expect(response.body.data).toHaveProperty("user");
			expect(response.body.data.user.email).toBe(userData.email);
			expect(response.body.data.user).not.toHaveProperty("password");

			testUserId = response.body.data.user.id;
			authToken = response.body.data.token;
		});

		it("should fail with invalid email format", async () => {
			const userData = {
				firstName: "Jane",
				lastName: "Smith",
				email: "invalid-email",
				password: "securePassword123!",
			};

			const response = await request(app).post("/auth/register").send(userData);

			expect(response.status).toBe(400);
		});

		it("should fail with duplicate email", async () => {
			const userData = {
				firstName: "Jane",
				lastName: "Smith",
				email: "john.doe@example.com", // Same email as first test
				password: "securePassword123!",
			};

			const response = await request(app).post("/auth/register").send(userData);

			expect(response.status).toBe(409);
			expect(response.body.success).toBe(false);
		});

		it("should fail with short password", async () => {
			const userData = {
				firstName: "Jane",
				lastName: "Smith",
				email: "jane.smith@example.com",
				password: "123", // Too short
			};

			const response = await request(app).post("/auth/register").send(userData);

			expect(response.status).toBe(400);
		});
	});

	describe("POST /auth/login", () => {
		it("should login successfully with correct credentials", async () => {
			const credentials = {
				email: "john.doe@example.com",
				password: "securePassword123!",
			};

			const response = await request(app).post("/auth/login").send(credentials);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("token");
			expect(response.body.data).toHaveProperty("user");
			expect(response.body.data.user.email).toBe(credentials.email);
		});

		it("should fail with incorrect password", async () => {
			const credentials = {
				email: "john.doe@example.com",
				password: "wrongPassword",
			};

			const response = await request(app).post("/auth/login").send(credentials);

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});

		it("should fail with non-existent email", async () => {
			const credentials = {
				email: "nonexistent@example.com",
				password: "somePassword",
			};

			const response = await request(app).post("/auth/login").send(credentials);

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
		});
	});

	describe("GET /auth/me", () => {
		it("should get current user with valid token", async () => {
			const response = await request(app).get("/auth/me").set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toHaveProperty("id");
			expect(response.body.data.email).toBe("john.doe@example.com");
			expect(response.body.data).not.toHaveProperty("password");
		});

		it("should fail without authorization header", async () => {
			const response = await request(app).get("/auth/me");

			expect(response.status).toBe(401);
		});

		it("should fail with invalid token", async () => {
			const response = await request(app).get("/auth/me").set("Authorization", "Bearer invalid-token");

			expect(response.status).toBe(403);
		});
	});

	describe("POST /auth/change-password", () => {
		it("should change password successfully", async () => {
			const passwordData = {
				currentPassword: "securePassword123!",
				newPassword: "newSecurePassword123!",
			};

			const response = await request(app)
				.post("/auth/change-password")
				.set("Authorization", `Bearer ${authToken}`)
				.send(passwordData);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should fail with incorrect current password", async () => {
			const passwordData = {
				currentPassword: "wrongPassword",
				newPassword: "newSecurePassword123!",
			};

			const response = await request(app)
				.post("/auth/change-password")
				.set("Authorization", `Bearer ${authToken}`)
				.send(passwordData);

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});

		it("should fail without authorization", async () => {
			const passwordData = {
				currentPassword: "newSecurePassword123!",
				newPassword: "anotherPassword123!",
			};

			const response = await request(app).post("/auth/change-password").send(passwordData);

			expect(response.status).toBe(401);
		});
	});

	describe("POST /auth/reset-password", () => {
		it("should handle password reset request", async () => {
			const response = await request(app).post("/auth/reset-password").send({ email: "john.doe@example.com" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should handle non-existent email gracefully", async () => {
			const response = await request(app).post("/auth/reset-password").send({ email: "nonexistent@example.com" });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
		});

		it("should fail without email", async () => {
			const response = await request(app).post("/auth/reset-password").send({});

			expect(response.status).toBe(400);
		});
	});

	describe("POST /auth/logout", () => {
		it("should logout successfully", async () => {
			const response = await request(app).post("/auth/logout").set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe("Logout successful");
		});

		it("should fail without authorization", async () => {
			const response = await request(app).post("/auth/logout");

			expect(response.status).toBe(401);
		});
	});
});
