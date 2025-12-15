import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/infrastructure/session";
import { RegisterForm } from "@/features/auth/presentation/components/RegisterForm";

export default async function RegisterPage() {
    const session = await getSession();
    
    if (session) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <RegisterForm />
        </div>
    );
}

