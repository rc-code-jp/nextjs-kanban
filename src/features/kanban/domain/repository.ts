import { Board, Column, Task } from "./types";

export interface KanbanRepository {
    getBoard(): Promise<Board>;
    createColumn(title: string): Promise<Column>;
    deleteColumn(columnId: string): Promise<void>;
    createTask(columnId: string, content: string): Promise<Task>;
    deleteTask(taskId: string): Promise<void>;
    moveTask(taskId: string, newColumnId: string, newOrder: number): Promise<void>;
    reorderColumn(columnId: string, newOrder: number): Promise<void>;
}
