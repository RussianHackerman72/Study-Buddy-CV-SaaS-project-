"use client";

import { useDroppable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";

export function BoardDropZone({
  id,
  icon: Icon,
  label,
  variant = "default",
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  variant?: "default" | "destructive";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const idleClass =
    variant === "destructive"
      ? "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500"
      : "border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-500";
  const overClass =
    variant === "destructive"
      ? "border-red-400 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
      : "border-indigo-400 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-400";

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs font-medium transition-colors ${
        isOver ? overClass : idleClass
      }`}
    >
      <Icon className="size-4" />
      {label}
    </div>
  );
}
