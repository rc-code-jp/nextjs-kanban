export type Task = {
    id: string;
    content: string;
    columnId: string;
    order: number;
};

export type Column = {
    id: string;
    title: string;
    order: number;
    tasks: Task[];
};

export type Board = {
    columns: Column[];
};
