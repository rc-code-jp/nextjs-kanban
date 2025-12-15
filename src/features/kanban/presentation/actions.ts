"use server";

import { revalidatePath } from "next/cache";
import {
    getBoardUseCase,
    createColumnUseCase,
    createTaskUseCase,
    moveTaskUseCase,
    deleteTaskUseCase,
    deleteColumnUseCase,
} from "../application/use-cases";

export async function getBoardAction() {
    return getBoardUseCase();
}

export async function createColumnAction(title: string) {
    await createColumnUseCase(title);
    revalidatePath("/");
}

export async function createTaskAction(columnId: string, content: string) {
    await createTaskUseCase(columnId, content);
    revalidatePath("/");
}

// For drag and drop, we might want to be optimistic and not revalidate immediately
// or return the new state. For simplicity, revalidate is safest.
export async function moveTaskAction(taskId: string, newColumnId: string, newOrder: number) {
    await moveTaskUseCase(taskId, newColumnId, newOrder);
    revalidatePath("/");
}

export async function deleteTaskAction(taskId: string) {
    await deleteTaskUseCase(taskId);
    revalidatePath("/");
}

export async function deleteColumnAction(columnId: string) {
    await deleteColumnUseCase(columnId);
    revalidatePath("/");
}
