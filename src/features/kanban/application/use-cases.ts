import { KanbanRepository } from "../domain/repository";
import { DrizzleKanbanRepository } from "../infrastructure/kanban-repository";

// In a real app, successful DI involves passing the repository.
// Here we instantiated it directly for simplicity, but kept the layering.
const repository: KanbanRepository = new DrizzleKanbanRepository();

export const getBoardUseCase = async () => {
    return repository.getBoard();
};

export const createColumnUseCase = async (title: string) => {
    return repository.createColumn(title);
};

export const deleteColumnUseCase = async (columnId: string) => {
    return repository.deleteColumn(columnId);
};

export const createTaskUseCase = async (columnId: string, content: string) => {
    return repository.createTask(columnId, content);
};

export const deleteTaskUseCase = async (taskId: string) => {
    return repository.deleteTask(taskId);
};

export const moveTaskUseCase = async (taskId: string, newColumnId: string, newOrder: number) => {
    return repository.moveTask(taskId, newColumnId, newOrder);
};
