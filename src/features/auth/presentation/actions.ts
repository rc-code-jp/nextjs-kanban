"use server";

import { redirect } from "next/navigation";
import { loginUseCase, registerUseCase } from "../application/use-cases";
import { createSession, deleteSession, getSession } from "../infrastructure/session";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export type ActionResult = {
    success: boolean;
    error?: string;
};

export async function loginAction(
    prevState: ActionResult,
    formData: FormData
): Promise<ActionResult> {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        };

        const validated = loginSchema.parse(data);
        const user = await loginUseCase(validated);

        if (!user) {
            return { success: false, error: "Invalid email or password" };
        }

        await createSession({
            userId: user.id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: "An error occurred during login" };
    }
    
    // Redirect outside of try-catch as Next.js redirect throws an error
    redirect("/");
}

export async function registerAction(
    prevState: ActionResult,
    formData: FormData
): Promise<ActionResult> {
    try {
        const data = {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            name: formData.get("name") as string,
        };

        const validated = registerSchema.parse(data);
        const user = await registerUseCase(validated);

        await createSession({
            userId: user.id,
            email: user.email,
            name: user.name,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        if (error instanceof Error) {
            if (error.message === "User already exists") {
                return { success: false, error: "User already exists" };
            }
            console.error("Registration error:", error);
            return { success: false, error: `Registration failed: ${error.message}` };
        }
        console.error("Unknown registration error:", error);
        return { success: false, error: "An error occurred during registration" };
    }
    
    // Redirect outside of try-catch as Next.js redirect throws an error
    redirect("/");
}

export async function logoutAction(): Promise<void> {
    await deleteSession();
    redirect("/login");
}

export async function getCurrentUserAction() {
    return await getSession();
}

