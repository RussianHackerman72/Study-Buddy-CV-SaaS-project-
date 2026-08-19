import { describe, expect, it } from "vitest";
import { createTaskSchema, updateTaskSchema } from "./task";

describe("createTaskSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = createTaskSchema.safeParse({ title: "Buy milk" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("MEDIUM");
      expect(result.data.status).toBe("TODO");
    }
  });

  it("rejects an empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const result = createTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("trims whitespace from the title", () => {
    const result = createTaskSchema.safeParse({ title: "  Buy milk  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Buy milk");
  });

  it("rejects a title over 200 characters", () => {
    const result = createTaskSchema.safeParse({ title: "a".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = createTaskSchema.safeParse({ title: "Task", priority: "URGENT" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = createTaskSchema.safeParse({ title: "Task", status: "ARCHIVED" });
    expect(result.success).toBe(false);
  });

  it("coerces a date string for dueDate", () => {
    const result = createTaskSchema.safeParse({ title: "Task", dueDate: "2026-01-01" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDate).toBeInstanceOf(Date);
  });

  it("allows a null dueDate and description", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      dueDate: null,
      description: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTaskSchema", () => {
  it("accepts an empty object (no-op update)", () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects an empty-string title", () => {
    const result = updateTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  // Regression test: updateTaskSchema used to be createTaskSchema.partial(), but Zod's
  // .default() still fires for omitted fields even when wrapped in .optional() by
  // .partial(), so a PATCH that only changed one field silently reset priority/status
  // back to their defaults. See commit "Fix PATCH silently resetting priority/status".
  it("does not inject default priority/status for fields omitted from a partial update", () => {
    const result = updateTaskSchema.safeParse({ status: "DONE" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ status: "DONE" });
      expect(result.data.priority).toBeUndefined();
    }
  });

  it("allows updating only the priority", () => {
    const result = updateTaskSchema.safeParse({ priority: "HIGH" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ priority: "HIGH" });
    }
  });

  it("allows setting archived", () => {
    const result = updateTaskSchema.safeParse({ archived: true });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.archived).toBe(true);
  });

  it("allows clearing dueDate and description with null", () => {
    const result = updateTaskSchema.safeParse({ dueDate: null, description: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeNull();
      expect(result.data.description).toBeNull();
    }
  });
});
