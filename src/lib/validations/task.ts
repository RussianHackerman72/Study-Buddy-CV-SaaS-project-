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

// Client-side form schema: keeps dueDate as a plain string (from an <input type="date">)
// instead of coercing to Date, so it maps directly onto controlled form fields.
export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().optional(),
  priority: priorityEnum,
  status: statusEnum,
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
