export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  status: Status;
  archived: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  subtasks: { id: string; title: string; completed: boolean; order: number; taskId: string }[];
  tags: {
    taskId: string;
    tagId: string;
    tag: { id: string; name: string; color: string; userId: string };
  }[];
};

export type SortOption = "createdAt" | "dueDate" | "priority";

export type TaskInput = {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: Priority;
  status?: Status;
};

async function parseErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  if (body?.error?.formErrors || body?.error?.fieldErrors) {
    const fieldMessages = Object.values(body.error.fieldErrors ?? {}).flat();
    const formMessages = body.error.formErrors ?? [];
    const message = [...formMessages, ...fieldMessages].filter(Boolean).join(", ");
    if (message) return message;
  }
  return fallback;
}

export async function fetchTasks(sort: SortOption = "createdAt"): Promise<Task[]> {
  const res = await fetch(`/api/tasks?sort=${sort}`);
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to load tasks"));
  return res.json();
}

export async function createTask(input: TaskInput): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to create task"));
  return res.json();
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to update task"));
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to delete task"));
}
