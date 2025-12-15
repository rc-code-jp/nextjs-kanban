import { getBoardUseCase } from "@/features/kanban/application/use-cases";
import { KanbanBoard } from "@/features/kanban/presentation/components/KanbanBoard";
import { getSession } from "@/features/auth/infrastructure/session";
import { UserMenu } from "@/features/auth/presentation/components/UserMenu";

export default async function Home() {
  const board = await getBoardUseCase();
  const session = await getSession();

  return (
    <main className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Kanban Board</h1>
        {session && <UserMenu user={session} />}
      </header>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialBoard={board} />
      </div>
    </main>
  );
}
