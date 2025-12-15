import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { AuthSession } from "../domain/types";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: AuthSession): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(token: string): Promise<AuthSession | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload as AuthSession;
    } catch (error) {
        return null;
    }
}

export async function createSession(session: AuthSession): Promise<void> {
    const token = await encrypt(session);
    const cookieStore = await cookies();
    
    cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });
}

export async function getSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    
    if (!token) {
        return null;
    }

    return await decrypt(token);
}

export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

