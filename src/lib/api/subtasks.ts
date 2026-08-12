import type { Task } from "./tasks";

export type Subtask = Task["subtasks"][number];

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

export async function createSubtask(taskId: string, title: string): Promise<Subtask> {
  const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to add subtask"));
  return res.json();
}

export async function updateSubtask(
  id: string,
  input: { title?: string; completed?: boolean },
): Promise<Subtask> {
  const res = await fetch(`/api/subtasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to update subtask"));
  return res.json();
}

export async function deleteSubtask(id: string): Promise<void> {
  const res = await fetch(`/api/subtasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to delete subtask"));
}
