import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/common/utils/envConfig";

export interface JwtPayload {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1]; // Bearer TOKEN

	if (!token) {
		return res.status(401).json({ error: "Access token required" });
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
		req.user = decoded;
		next();
	} catch {
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];

	if (!token) {
		return next();
	}

	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
		req.user = decoded;
	} catch {
		// Token is invalid, but continue without user
	}

	next();
};
