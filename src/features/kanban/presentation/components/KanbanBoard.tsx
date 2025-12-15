"use client";

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Board, Column, Task } from "@/features/kanban/domain/types";
import { useEffect, useState, useTransition } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { createColumnAction, moveTaskAction } from "../actions"; // We'll add moveColumnAction later
import { Plus } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
    initialBoard: Board;
}

export function KanbanBoard({ initialBoard }: Props) {
    const [board, setBoard] = useState(initialBoard);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [isClient, setIsClient] = useState(false);

    const [pending, startTransition] = useTransition();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        setBoard(initialBoard);
    }, [initialBoard]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement before drag starts
            },
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    // Handle visual updates while dragging
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return; // We only handle task moving over things specifically here

        // Im dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setBoard((board) => {
                const activeColumnIndex = board.columns.findIndex(col =>
                    col.tasks.some(t => t.id === activeId)
                );
                const overColumnIndex = board.columns.findIndex(col =>
                    col.tasks.some(t => t.id === overId)
                );

                if (activeColumnIndex === -1 || overColumnIndex === -1) return board;

                const activeColumn = board.columns[activeColumnIndex];
                const overColumn = board.columns[overColumnIndex];

                const activeTaskIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
                const overTaskIndex = overColumn.tasks.findIndex(t => t.id === overId);

                if (activeColumnIndex === overColumnIndex) {
                    // Same column reorder - we can let DragEnd handle final state, but visual update:
                    const newTasks = arrayMove(activeColumn.tasks, activeTaskIndex, overTaskIndex);
                    const newColumns = [...board.columns];
                    newColumns[activeColumnIndex] = { ...activeColumn, tasks: newTasks };
                    return { ...board, columns: newColumns };
                } else {
                    // Different column
                    const activeTask = activeColumn.tasks[activeTaskIndex];

                    const newActiveTasks = [...activeColumn.tasks];
                    newActiveTasks.splice(activeTaskIndex, 1);

                    const newOverTasks = [...overColumn.tasks];
                    // Insert after or before? Simple strategy: insert at overIndex
                    // If moving down, we want to be below. If moving up...
                    // Only relying on index is tricky.

                    // Let's rely on arrayMove convention which handles this but we need to inject first.
                    // Actually dnd-kit examples suggest handling this in DragOver by physically moving the item in state.

                    newOverTasks.splice(overTaskIndex, 0, { ...activeTask, columnId: overColumn.id });

                    const newColumns = [...board.columns];
                    newColumns[activeColumnIndex] = { ...activeColumn, tasks: newActiveTasks };
                    newColumns[overColumnIndex] = { ...overColumn, tasks: newOverTasks };

                    return { ...board, columns: newColumns };
                }
            });
        }

        // Im dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setBoard((board) => {
                const activeColumnIndex = board.columns.findIndex(col =>
                    col.tasks.some(t => t.id === activeId)
                );
                const overColumnIndex = board.columns.findIndex(col => col.id === overId);

                if (activeColumnIndex === -1 || overColumnIndex === -1) return board;
                if (activeColumnIndex === overColumnIndex) return board;

                const activeColumn = board.columns[activeColumnIndex];
                const overColumn = board.columns[overColumnIndex];

                const activeTaskIndex = activeColumn.tasks.findIndex(t => t.id === activeId);
                const activeTask = activeColumn.tasks[activeTaskIndex];

                const newActiveTasks = [...activeColumn.tasks];
                newActiveTasks.splice(activeTaskIndex, 1);

                const newOverTasks = [...overColumn.tasks];
                newOverTasks.push({ ...activeTask, columnId: overColumn.id });

                const newColumns = [...board.columns];
                newColumns[activeColumnIndex] = { ...activeColumn, tasks: newActiveTasks };
                newColumns[overColumnIndex] = { ...overColumn, tasks: newOverTasks };

                return { ...board, columns: newColumns };
            });
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Removed early return activeId === overId to allow persistence even if dnd-kit thinks we didn't move
        // (because onDragOver already moved the item visually to the spot under the cursor).

        // Handle Column Reordering
        if (active.data.current?.type === "Column") {
            // We do not have visual updates for column reorder in onDragOver to keep it simple,
            // so we do it here. Or we could add it to dragOver.
            // For columns, usually arrayMove on end is enough.
            setBoard((board) => {
                const activeIndex = board.columns.findIndex((col) => col.id === activeId);
                const overIndex = board.columns.findIndex((col) => col.id === overId);
                if (activeIndex === -1 || overIndex === -1) return board;

                const newColumns = arrayMove(board.columns, activeIndex, overIndex);

                // TODO: Server Action for Reorder Columns
                // startTransition(async () => await reorderColumnAction(...) ); 

                return { ...board, columns: newColumns };
            });
            return;
        }

        // Handle Task Reordering / Moving
        // Note: onDragOver has already moved the item in 'board' state to the new column!
        // So here we essentially just need to persist the FINAL state to the server.
        // We need to find where the task ended up.

        // However, onDragOver changed the board state, so 'activeId' might exist in a different place now.
        // We need to find the task in the *current* board state to know its new column and new index.

        const columns = board.columns;
        const activeColumn = columns.find(col => col.tasks.some(t => t.id === activeId));

        if (activeColumn) {
            const taskIndex = activeColumn.tasks.findIndex(t => t.id === activeId);

            // Persist to DB
            startTransition(async () => {
                try {
                    await moveTaskAction(String(activeId), activeColumn.id, taskIndex);
                } catch (e) {
                    // Handle error
                }
            });
        } else {
            // Handle error
        }
    };

    const handleCreateColumn = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newColumnTitle.trim()) return;
        startTransition(async () => {
            await createColumnAction(newColumnTitle);
            setNewColumnTitle("");
        });
    }

    // Prevent hydration mismatch
    if (!isClient) return null;

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-card">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">Antigravity Kanban</h1>
                <form onSubmit={handleCreateColumn} className="flex gap-2">
                    <input
                        className="bg-muted px-3 py-2 rounded-md text-sm min-w-[200px] border border-transparent focus:border-primary outline-none transition-colors"
                        placeholder="New Column Title"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                    />
                    <button
                        disabled={!newColumnTitle.trim()}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Plus size={16} /> Add Column
                    </button>
                </form>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
            >
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <div className="flex gap-6 h-full items-start w-fit">
                        <SortableContext items={board.columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
                            {board.columns.map((col) => (
                                <KanbanColumn key={col.id} column={col} tasks={col.tasks} />
                            ))}
                        </SortableContext>
                    </div>
                </div>

                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <KanbanColumn column={activeColumn} tasks={activeColumn.tasks} />
                        )}
                        {activeTask && (
                            <KanbanCard task={activeTask} />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
}
