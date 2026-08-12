"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createSubtask, deleteSubtask, updateSubtask, type Subtask } from "@/lib/api/subtasks";

export function SubtaskSection({
  taskId,
  initialSubtasks,
}: {
  taskId: string;
  initialSubtasks: Subtask[];
}) {
  const queryClient = useQueryClient();
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  function syncTaskList() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function handleAdd() {
    const title = newTitle.trim();
    if (!title) return;

    setIsAdding(true);
    try {
      const subtask = await createSubtask(taskId, title);
      setSubtasks((prev) => [...prev, subtask]);
      setNewTitle("");
      syncTaskList();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add subtask");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleToggle(subtask: Subtask) {
    const nextCompleted = !subtask.completed;
    setSubtasks((prev) =>
      prev.map((item) => (item.id === subtask.id ? { ...item, completed: nextCompleted } : item)),
    );
    try {
      await updateSubtask(subtask.id, { completed: nextCompleted });
      syncTaskList();
    } catch (error) {
      setSubtasks((prev) =>
        prev.map((item) =>
          item.id === subtask.id ? { ...item, completed: subtask.completed } : item,
        ),
      );
      toast.error(error instanceof Error ? error.message : "Failed to update subtask");
    }
  }

  async function handleDelete(subtask: Subtask) {
    setSubtasks((prev) => prev.filter((item) => item.id !== subtask.id));
    try {
      await deleteSubtask(subtask.id);
      syncTaskList();
    } catch (error) {
      setSubtasks((prev) => [...prev, subtask].sort((a, b) => a.order - b.order));
      toast.error(error instanceof Error ? error.message : "Failed to delete subtask");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
        Subtasks
        {subtasks.length > 0 && (
          <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-500">
            {subtasks.filter((subtask) => subtask.completed).length}/{subtasks.length}
          </span>
        )}
      </p>

      {subtasks.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <Checkbox checked={subtask.completed} onCheckedChange={() => handleToggle(subtask)} />
              <span
                className={`flex-1 text-sm ${
                  subtask.completed
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {subtask.title}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(subtask)}
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Delete subtask</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Add a subtask"
          className="h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isAdding || !newTitle.trim()}
          onClick={handleAdd}
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Add subtask</span>
        </Button>
      </div>
    </div>
  );
}
