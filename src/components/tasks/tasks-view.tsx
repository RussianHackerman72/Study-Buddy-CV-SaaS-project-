"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, ArchiveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTasks, updateTask, type SortOption, type Task } from "@/lib/api/tasks";
import { TaskCard } from "./task-card";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskSortSelect } from "./task-sort-select";
import { TagFilterSelect } from "./tag-filter-select";
import { TaskSearchInput } from "./task-search-input";
import { useDebouncedValue } from "@/lib/use-debounced-value";

export function TasksView() {
  const [sort, setSort] = useState<SortOption>("createdAt");
  const [tagId, setTagId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const queryClient = useQueryClient();

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks", sort, tagId, debouncedSearch],
    queryFn: () => fetchTasks({ sort, tagId, q: debouncedSearch }),
  });

  const archiveMutation = useMutation({
    mutationFn: (task: Task) => updateTask(task.id, { archived: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task archived");
    },
    onError: (error: Error) => toast.error(error.message),
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="shrink-0 text-xl font-semibold tracking-tight whitespace-nowrap text-zinc-950 dark:text-zinc-50">
          Your tasks
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <TagFilterSelect value={tagId} onChange={setTagId} />
          <TaskSortSelect value={sort} onChange={setSort} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/archive" />}
          >
            <ArchiveIcon className="size-4" />
            Archive
          </Button>
          <Button onClick={openCreateForm}>
            <PlusIcon className="size-4" />
            New task
          </Button>
        </div>
      </div>

      <TaskSearchInput value={search} onChange={setSearch} />

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
          <p className="font-medium text-zinc-950 dark:text-zinc-50">
            {debouncedSearch
              ? "No matching tasks"
              : tagId
                ? "No tasks with this tag"
                : "No tasks yet"}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {debouncedSearch
              ? "Try a different search term."
              : tagId
                ? "Try a different tag or clear the filter."
                : "Create your first task to get started."}
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
              onArchive={() => archiveMutation.mutate(task)}
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
