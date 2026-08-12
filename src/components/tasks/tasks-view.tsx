"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTasks, type SortOption, type Task } from "@/lib/api/tasks";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskSortSelect } from "./task-sort-select";

export function TasksView() {
  const [sort, setSort] = useState<SortOption>("createdAt");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks", sort],
    queryFn: () => fetchTasks(sort),
  });

  function openCreateForm() {
    setEditingTask(undefined);
    setFormOpen(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Your tasks
        </h1>
        <div className="flex items-center gap-2">
          <TaskSortSelect value={sort} onChange={setSort} />
          <Button onClick={openCreateForm}>
            <PlusIcon className="size-4" />
            New task
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Couldn&apos;t load your tasks. Try refreshing the page.
        </p>
      )}

      {!isLoading && !isError && tasks?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-12 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-950 dark:text-zinc-50">No tasks yet</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create your first task to get started.
          </p>
        </div>
      )}

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => openEditForm(task)}
              onDelete={() => setDeletingTask(task)}
            />
          ))}
        </div>
      )}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} />
      <DeleteTaskDialog
        open={deletingTask !== null}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        task={deletingTask}
      />
    </div>
  );
}
