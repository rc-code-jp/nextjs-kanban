"use client";

import { logoutAction } from "../actions";
import { AuthSession } from "../../domain/types";

export function UserMenu({ user }: { user: AuthSession }) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{user.name}</span>
            </span>
            <form action={logoutAction}>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                    Logout
                </button>
            </form>
        </div>
    );
}

