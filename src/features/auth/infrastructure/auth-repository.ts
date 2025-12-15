import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db/db";
import { users } from "@/infrastructure/db/schema";
import { AuthRepository } from "../domain/repository";
import { User, RegisterData } from "../domain/types";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export class DrizzleAuthRepository implements AuthRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (result.length === 0) {
            return null;
        }

        const user = result[0];
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        };
    }

    async findUserById(id: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        
        if (result.length === 0) {
            return null;
        }

        const user = result[0];
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        };
    }

    async createUser(data: RegisterData): Promise<User> {
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(data.password, 10);
        const now = new Date();

        await db.insert(users).values({
            id,
            email: data.email,
            passwordHash,
            name: data.name,
            createdAt: now,
        });

        return {
            id,
            email: data.email,
            name: data.name,
            createdAt: now,
        };
    }

    async verifyPassword(email: string, password: string): Promise<boolean> {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (result.length === 0) {
            return false;
        }

        const user = result[0];
        return await bcrypt.compare(password, user.passwordHash);
    }
}

