import { z } from "zod";

export const createSubtaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export const updateSubtaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  completed: z.boolean().optional(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
