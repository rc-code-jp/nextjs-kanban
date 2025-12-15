import { eq, asc } from "drizzle-orm";
import { db } from "@/infrastructure/db/db";
import { columns, tasks } from "@/infrastructure/db/schema";
import { KanbanRepository } from "../domain/repository";
import { Board, Column, Task } from "../domain/types";
import { v4 as uuidv4 } from "uuid";

export class DrizzleKanbanRepository implements KanbanRepository {
    async getBoard(): Promise<Board> {
        const allColumns = await db.select().from(columns).orderBy(asc(columns.order));
        const allTasks = await db.select().from(tasks).orderBy(asc(tasks.order));

        const boardColumns: Column[] = allColumns.map((col) => ({
            id: col.id,
            title: col.title,
            order: col.order,
            tasks: allTasks
                .filter((t) => t.columnId === col.id)
                .map((t) => ({
                    id: t.id,
                    content: t.content,
                    columnId: t.columnId,
                    order: t.order,
                })),
        }));

        return { columns: boardColumns };
    }

    async createColumn(title: string): Promise<Column> {
        const id = uuidv4();
        const existing = await db.select().from(columns);
        const order = existing.length;

        await db.insert(columns).values({
            id,
            title,
            order,
        });

        return { id, title, order, tasks: [] };
    }

    async deleteColumn(columnId: string): Promise<void> {
        await db.delete(columns).where(eq(columns.id, columnId));
    }

    async createTask(columnId: string, content: string): Promise<Task> {
        const id = uuidv4();
        const colTasks = await db.select().from(tasks).where(eq(tasks.columnId, columnId));
        const order = colTasks.length;

        await db.insert(tasks).values({
            id,
            content,
            columnId,
            order,
        });

        return { id, content, columnId, order };
    }

    async deleteTask(taskId: string): Promise<void> {
        await db.delete(tasks).where(eq(tasks.id, taskId));
    }

    async moveTask(taskId: string, newColumnId: string, newOrder: number): Promise<void> {
        // 1. Get all tasks in the target column (excluding the one being moved, to avoid confusion if it's already there)
        const targetColumnTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.columnId, newColumnId))
            .orderBy(asc(tasks.order));

        // Filter out the task being moved if it's in the list (same column move) or just to be safe
        const otherTasks = targetColumnTasks.filter((t) => t.id !== taskId);

        // 2. Insert the task at the new position locally
        // We need to know what the task object is, or at least we know its ID.
        // We can just represent it by its ID for the order update.

        // Ensure newOrder is within bounds [0, length]
        const clampedOrder = Math.max(0, Math.min(newOrder, otherTasks.length));

        const newOrderList = [
            ...otherTasks.slice(0, clampedOrder),
            { id: taskId }, // Placeholder for the moved task
            ...otherTasks.slice(clampedOrder),
        ];

        // 3. Update all tasks with their new order
        // We use a transaction or sequential updates. SQLite is fast enough for sequential here.
        // We update the moved task to have the new Column ID as well.

        for (let i = 0; i < newOrderList.length; i++) {
            const t = newOrderList[i];
            if (t.id === taskId) {
                await db.update(tasks)
                    .set({ columnId: newColumnId, order: i })
                    .where(eq(tasks.id, taskId));
            } else {
                // Only update if order changed to optimize? 
                // For simplicity/robustness, just update. 
                // Optimization: check if (t.order !== i)
                await db.update(tasks)
                    .set({ order: i })
                    .where(eq(tasks.id, t.id));
            }
        }
    }

    async reorderColumn(columnId: string, newOrder: number): Promise<void> {
        await db.update(columns).set({ order: newOrder }).where(eq(columns.id, columnId));
    }
}
