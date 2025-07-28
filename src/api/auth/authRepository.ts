import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { env } from "@/common/utils/envConfig";
import { usersTable } from "@/db/schema";
import { db } from "@/utils/db";
import type { Login, Register } from "./authModel";

export class AuthRepository {
	private readonly JWT_SECRET = env.JWT_SECRET;
	private readonly JWT_EXPIRES_IN = "24h";
	private readonly SALT_ROUNDS = 12;

	// Hash password
	private async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, this.SALT_ROUNDS);
	}

	// Compare password
	private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword);
	}

	// Generate JWT token
	private generateToken(user: {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
	}): string {
		return jwt.sign(
			{
				id: user.id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
			},
			this.JWT_SECRET,
			{ expiresIn: this.JWT_EXPIRES_IN },
		);
	}

	// Verify JWT token
	public verifyToken(token: string): {
		id: number;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
	} {
		try {
			return jwt.verify(token, this.JWT_SECRET) as {
				id: number;
				email: string;
				firstName: string;
				lastName: string;
				role: string;
			};
		} catch {
			throw new Error("Invalid token");
		}
	}

	// Register new user
	async register(userData: Register) {
		// Check if user already exists
		const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1);

		if (existingUser.length > 0) {
			throw new Error("User already exists with this email");
		}

		// Hash password
		const hashedPassword = await this.hashPassword(userData.password);

		// Create user
		const [newUser] = await db
			.insert(usersTable)
			.values({
				...userData,
				password: hashedPassword,
			})
			.returning();

		// Generate token
		const token = this.generateToken({
			id: newUser.id,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			role: newUser.role,
		});

		// Return user without password
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userWithoutPassword } = newUser;
		return {
			user: userWithoutPassword,
			token,
		};
	}

	// Login user
	async login(credentials: Login) {
		// Find user by email
		const [user] = await db.select().from(usersTable).where(eq(usersTable.email, credentials.email)).limit(1);

		if (!user) {
			throw new Error("Invalid email or password");
		}

		// Check password
		const isPasswordValid = await this.comparePassword(credentials.password, user.password);
		if (!isPasswordValid) {
			throw new Error("Invalid email or password");
		}

		// Generate token
		const token = this.generateToken({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
		});

		// Return user without password
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...userWithoutPassword } = user;
		return {
			user: userWithoutPassword,
			token,
		};
	}

	// Get user by ID
	async getUserById(id: number) {
		const [user] = await db
			.select({
				id: usersTable.id,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
				email: usersTable.email,
				role: usersTable.role,
				avatar: usersTable.avatar,
				isActive: usersTable.isActive,
				createdAt: usersTable.createdAt,
				updatedAt: usersTable.updatedAt,
			})
			.from(usersTable)
			.where(eq(usersTable.id, id))
			.limit(1);

		return user || null;
	}

	// Change password
	async changePassword(userId: number, currentPassword: string, newPassword: string) {
		// Get user with password
		const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

		if (!user) {
			throw new Error("User not found");
		}

		// Verify current password
		const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
		if (!isCurrentPasswordValid) {
			throw new Error("Current password is incorrect");
		}

		// Hash new password
		const hashedNewPassword = await this.hashPassword(newPassword);

		// Update password
		await db
			.update(usersTable)
			.set({
				password: hashedNewPassword,
				updatedAt: new Date(),
			})
			.where(eq(usersTable.id, userId));

		return true;
	}

	// Find user by email (for password reset)
	async findUserByEmail(email: string) {
		const [user] = await db
			.select({
				id: usersTable.id,
				firstName: usersTable.firstName,
				lastName: usersTable.lastName,
				email: usersTable.email,
			})
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);

		return user || null;
	}
}
