"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { CalendarIcon, GripVerticalIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/api/tasks";
import { priorityBadgeClass, priorityLabels, priorityStripeClass } from "./task-labels";
import { TagBadge } from "./tag-badge";

export function BoardCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
  const subtaskProgress =
    task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group flex cursor-grab flex-col gap-1.5 rounded-lg border border-l-4 border-zinc-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950 ${priorityStripeClass[task.priority]} ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{task.title}</p>
        <GripVerticalIcon className="size-4 shrink-0 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-700" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={priorityBadgeClass[task.priority]}>{priorityLabels[task.priority]}</Badge>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-500">
            <CalendarIcon className="size-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {task.tags.map(({ tag }) => (
          <TagBadge key={tag.id} name={tag.name} color={tag.color} />
        ))}
      </div>

      {task.subtasks.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {completedSubtasks}/{task.subtasks.length}
          </span>
        </div>
      )}
    </div>
  );
}
