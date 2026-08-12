export type Tag = {
  id: string;
  name: string;
  color: string;
  userId: string;
};

async function parseErrorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  if (typeof body?.error === "string") return body.error;
  if (body?.error?.formErrors || body?.error?.fieldErrors) {
    const fieldMessages = Object.values(body.error.fieldErrors ?? {}).flat();
    const formMessages = body.error.formErrors ?? [];
    const message = [...formMessages, ...fieldMessages].filter(Boolean).join(", ");
    if (message) return message;
  }
  return fallback;
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/tags");
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to load tags"));
  return res.json();
}

export async function createTag(input: { name: string; color: string }): Promise<Tag> {
  const res = await fetch("/api/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to create tag"));
  return res.json();
}

export async function deleteTag(id: string): Promise<void> {
  const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to delete tag"));
}

export async function assignTag(taskId: string, tagId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagId }),
  });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to assign tag"));
}

export async function removeTag(taskId: string, tagId: string): Promise<void> {
  const res = await fetch(`/api/tasks/${taskId}/tags/${tagId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await parseErrorMessage(res, "Failed to remove tag"));
}
