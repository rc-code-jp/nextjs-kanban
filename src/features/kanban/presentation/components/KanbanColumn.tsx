"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task } from "@/features/kanban/domain/types";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { twMerge } from "tailwind-merge";
import { Plus, Trash2, GripHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { createTaskAction, deleteColumnAction } from "../actions";

interface Props {
    column: Column;
    tasks: Task[];
}

export function KanbanColumn({ column, tasks }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [newTaskContent, setNewTaskContent] = useState("");
    const [pending, startTransition] = useTransition();

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskContent.trim()) return;
        startTransition(async () => {
            await createTaskAction(column.id, newTaskContent);
            setNewTaskContent("");
        });
    };

    const onDelete = () => {
        if (!window.confirm("Are you sure you want to delete this column? All tasks in it will be lost.")) return;
        startTransition(async () => {
            await deleteColumnAction(column.id);
        });
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-muted/50 w-[350px] rounded-xl h-[500px] border-2 border-primary/20"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-muted/50 w-[350px] rounded-xl flex flex-col h-fit max-h-[80vh] border border-transparent hover:border-border/50 transition-colors"
        >
            <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-muted p-1 rounded">
                        <GripHorizontal size={16} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-mono">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={onDelete}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pt-0 gap-3 flex flex-col min-h-[100px]">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <KanbanCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </div>

            <div className="p-4 border-t border-muted-foreground/10">
                <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add a task..."
                        value={newTaskContent}
                        onChange={(e) => setNewTaskContent(e.target.value)}
                        className="flex-1 bg-background text-sm px-3 py-2 rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                        type="submit"
                        disabled={pending || !newTaskContent.trim()}
                        className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Plus size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
