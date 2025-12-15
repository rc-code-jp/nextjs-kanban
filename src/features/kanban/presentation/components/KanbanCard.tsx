"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/features/kanban/domain/types";
import { GripVertical, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTransition } from "react";
import { deleteTaskAction } from "../actions";

interface Props {
    task: Task;
}

export function KanbanCard({ task }: Props) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const [pending, startTransition] = useTransition();

    const onDelete = () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        startTransition(async () => {
            await deleteTaskAction(task.id);
        });
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={twMerge(
                    "bg-background p-4 rounded-lg shadow-sm border-2 border-primary/20 opacity-30 h-[100px]"
                )}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style} // Removed {...attributes} {...listeners} from main div
            className={twMerge(
                "group bg-card p-4 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors flex items-start gap-2 relative",
                pending && "opacity-50"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
                <GripVertical size={16} />
            </div>
            <div className="flex-1 text-sm break-all whitespace-pre-wrap">{task.content}</div>
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive transition-opacity"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
