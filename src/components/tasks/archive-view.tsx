"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTasks, updateTask, type Task } from "@/lib/api/tasks";
import { ArchivedTaskCard } from "./archived-task-card";
import { DeleteTaskDialog } from "./delete-task-dialog";

export function ArchiveView() {
  const queryClient = useQueryClient();
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const {
    data: tasks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks", "archived"],
    queryFn: () => fetchTasks({ archived: true }),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (task: Task) => updateTask(task.id, { archived: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task restored");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <ArrowLeftIcon className="size-4" />
            <span className="sr-only">Back to tasks</span>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Archive
          </h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          Couldn&apos;t load your archive. Try refreshing the page.
        </p>
      )}

      {!isLoading && !isError && tasks?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-12 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-950 dark:text-zinc-50">Nothing archived yet</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Archived tasks will show up here.
          </p>
        </div>
      )}

      {!isLoading && !isError && tasks && tasks.length > 0 && (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <ArchivedTaskCard
              key={task.id}
              task={task}
              onUnarchive={() => unarchiveMutation.mutate(task)}
              onDelete={() => setDeletingTask(task)}
            />
          ))}
        </div>
      )}

      <DeleteTaskDialog
        open={deletingTask !== null}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        task={deletingTask}
      />
    </div>
  );
}
