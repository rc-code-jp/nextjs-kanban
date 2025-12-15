import { AuthRepository } from "../domain/repository";
import { DrizzleAuthRepository } from "../infrastructure/auth-repository";
import { UserCredentials, RegisterData, User } from "../domain/types";

const repository: AuthRepository = new DrizzleAuthRepository();

export const loginUseCase = async (credentials: UserCredentials): Promise<User | null> => {
    const isValid = await repository.verifyPassword(credentials.email, credentials.password);
    
    if (!isValid) {
        return null;
    }

    return repository.findUserByEmail(credentials.email);
};

export const registerUseCase = async (data: RegisterData): Promise<User> => {
    // Check if user already exists
    const existingUser = await repository.findUserByEmail(data.email);
    if (existingUser) {
        throw new Error("User already exists");
    }

    return repository.createUser(data);
};

export const getUserByIdUseCase = async (id: string): Promise<User | null> => {
    return repository.findUserById(id);
};

export const getUserByEmailUseCase = async (email: string): Promise<User | null> => {
    return repository.findUserByEmail(email);
};

