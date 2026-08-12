"use client";

import { format } from "date-fns";
import { MoreVertical, Pencil, Trash2, CalendarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task } from "@/lib/api/tasks";
import { priorityBadgeClass, priorityLabels, statusBadgeClass, statusLabels } from "./task-labels";
import { TagBadge } from "./tag-badge";

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-0 flex-col gap-1.5">
        <p className="font-medium text-zinc-950 dark:text-zinc-50">{task.title}</p>
        {task.description && (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={statusBadgeClass[task.status]}>{statusLabels[task.status]}</Badge>
          <Badge className={priorityBadgeClass[task.priority]}>
            {priorityLabels[task.priority]}
          </Badge>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
              <CalendarIcon className="size-3" />
              {format(new Date(task.dueDate), "MMM d, yyyy")}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500">
              {completedSubtasks}/{task.subtasks.length} subtasks
            </span>
          )}
          {task.tags.map(({ tag }) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <MoreVertical className="size-4" />
              <span className="sr-only">Task actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
