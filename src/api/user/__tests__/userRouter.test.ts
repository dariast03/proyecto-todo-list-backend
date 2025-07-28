import { StatusCodes } from "http-status-codes";
import request from "supertest";

import type { User } from "@/api/user/userModel";
import type { ServiceResponse } from "@/common/models/serviceResponse";
import { app } from "@/server";

describe("User API Endpoints", () => {
	describe("GET /users", () => {
		it("should return a list of users", async () => {
			// Act
			const response = await request(app).get("/users");
			const responseBody: ServiceResponse<User[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("Users found");
			expect(Array.isArray(responseBody.data)).toBeTruthy();
		});
	});

	describe("GET /users/:id", () => {
		it("should return a user for a valid ID", async () => {
			// Arrange
			const testId = 1;

			// Act
			const response = await request(app).get(`/users/${testId}`);
			const responseBody: ServiceResponse<User> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toContain("User found");
			expect(responseBody.data).toBeDefined();
			expect(responseBody.data.id).toBe(testId);
		});

		it("should return a not found error for non-existent ID", async () => {
			// Arrange
			const testId = Number.MAX_SAFE_INTEGER;

			// Act
			const response = await request(app).get(`/users/${testId}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("User not found");
			expect(responseBody.data).toBeNull();
		});

		it("should return a bad request for invalid ID format", async () => {
			// Act
			const invalidInput = "abc";
			const response = await request(app).get(`/users/${invalidInput}`);
			const responseBody: ServiceResponse = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
			expect(responseBody.success).toBeFalsy();
			expect(responseBody.message).toContain("Invalid input");
			expect(responseBody.data).toBeNull();
		});
	});
});
