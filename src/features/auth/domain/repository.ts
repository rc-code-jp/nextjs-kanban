import { User, UserCredentials, RegisterData } from "./types";

export interface AuthRepository {
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: string): Promise<User | null>;
    createUser(data: RegisterData): Promise<User>;
    verifyPassword(email: string, password: string): Promise<boolean>;
}

