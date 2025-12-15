import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/infrastructure/session";
import { LoginForm } from "@/features/auth/presentation/components/LoginForm";

export default async function LoginPage() {
    const session = await getSession();
    
    if (session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoginForm />
        </div>
    );
}

