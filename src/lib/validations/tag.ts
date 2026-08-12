import { z } from "zod";

const hexColor = /^#[0-9a-fA-F]{6}$/;

export const createTagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  color: z.string().regex(hexColor, "Must be a hex color like #6366f1").default("#6366f1"),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50).optional(),
  color: z.string().regex(hexColor, "Must be a hex color like #6366f1").optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
