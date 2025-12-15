import { getBoardUseCase } from "@/features/kanban/application/use-cases";
import { KanbanBoard } from "@/features/kanban/presentation/components/KanbanBoard";

export default async function Home() {
  const board = await getBoardUseCase();

  return (
    <main className="h-screen w-screen bg-background text-foreground overflow-hidden">
      <KanbanBoard initialBoard={board} />
    </main>
  );
}
