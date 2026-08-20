import type { Priority, Status } from "@/lib/api/tasks";

export const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const statusLabels: Record<Status, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const priorityBadgeClass: Record<Priority, string> = {
  LOW: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export const statusBadgeClass: Record<Status, string> = {
  TODO: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
};

// Left-edge accent stripe on board cards, so priority reads at a glance without
// having to parse the badge text.
export const priorityStripeClass: Record<Priority, string> = {
  LOW: "border-l-zinc-300 dark:border-l-zinc-700",
  MEDIUM: "border-l-amber-400 dark:border-l-amber-500",
  HIGH: "border-l-red-500 dark:border-l-red-500",
};

// Small solid dot used on board column headers to color-code each column.
export const statusDotClass: Record<Status, string> = {
  TODO: "bg-zinc-400 dark:bg-zinc-500",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-green-500",
};
