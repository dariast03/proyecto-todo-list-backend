import type { User } from "@/api/user/userModel";
import { usersTable } from "@/db/schema";
import { db } from "@/utils/db";

export const users: User[] = [
	{
		id: 1,
		name: "Alice",
		email: "alice@example.com",
		age: 42,
	},
	{
		id: 2,
		name: "Robert",
		email: "Robert@example.com",
		age: 21,
	},
];

export class UserRepository {
	async findAllAsync(): Promise<User[]> {
		const users = await db.select().from(usersTable);
		console.log("Getting all users from the database: ", users);
		return users;
	}

	async findByIdAsync(id: number): Promise<User | null> {
		return users.find((user) => user.id === id) || null;
	}
}
