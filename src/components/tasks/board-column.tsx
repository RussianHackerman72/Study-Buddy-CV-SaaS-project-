"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import type { Task, Status } from "@/lib/api/tasks";
import { statusDotClass, statusLabels } from "./task-labels";
import { BoardCard } from "./board-card";

export function BoardColumn({
  status,
  tasks,
  onCardClick,
}: {
  status: Status;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div className="flex w-full flex-col gap-3 sm:w-72 sm:shrink-0">
      <div className="flex items-center gap-2 px-1">
        <span className={`size-2 rounded-full ${statusDotClass[status]}`} />
        <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
          {statusLabels[status]}
        </h2>
        <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className="flex min-h-24 flex-col gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          {tasks.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
              No tasks yet
            </p>
          )}
          {tasks.map((task) => (
            <BoardCard key={task.id} task={task} onClick={() => onCardClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
