import { z } from "zod";

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const statusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: priorityEnum.default("MEDIUM"),
  status: statusEnum.default("TODO"),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: priorityEnum.optional(),
  status: statusEnum.optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
