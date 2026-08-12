"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTag, createTag, fetchTags, removeTag, type Tag } from "@/lib/api/tags";
import { TagBadge } from "./tag-badge";

const presetColors = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
];

export function TaskTagsSection({
  taskId,
  initialTags,
}: {
  taskId: string;
  initialTags: { tagId: string; tag: Tag }[];
}) {
  const queryClient = useQueryClient();
  const [assigned, setAssigned] = useState(initialTags);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(presetColors[0]);
  const [isCreating, setIsCreating] = useState(false);

  const { data: allTags = [] } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const assignedIds = new Set(assigned.map((item) => item.tagId));
  const availableTags = allTags.filter((tag) => !assignedIds.has(tag.id));

  function syncTaskList() {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function handleAssign(tag: Tag) {
    setAssigned((prev) => [...prev, { tagId: tag.id, tag }]);
    setSelectedTagId(null);
    try {
      await assignTag(taskId, tag.id);
      syncTaskList();
    } catch (error) {
      setAssigned((prev) => prev.filter((item) => item.tagId !== tag.id));
      toast.error(error instanceof Error ? error.message : "Failed to assign tag");
    }
  }

  async function handleRemove(tag: Tag) {
    setAssigned((prev) => prev.filter((item) => item.tagId !== tag.id));
    try {
      await removeTag(taskId, tag.id);
      syncTaskList();
    } catch (error) {
      setAssigned((prev) => [...prev, { tagId: tag.id, tag }]);
      toast.error(error instanceof Error ? error.message : "Failed to remove tag");
    }
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;

    setIsCreating(true);
    try {
      const tag = await createTag({ name, color: newColor });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setNewName("");
      await handleAssign(tag);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Tags</p>

      {assigned.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {assigned.map(({ tag }) => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              color={tag.color}
              onRemove={() => handleRemove(tag)}
            />
          ))}
        </div>
      )}

      {availableTags.length > 0 && (
        <Select
          value={selectedTagId}
          onValueChange={(id: string | null) => {
            const tag = availableTags.find((t) => t.id === id);
            if (tag) handleAssign(tag);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add an existing tag" />
          </SelectTrigger>
          <SelectContent>
            {availableTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {presetColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setNewColor(color)}
              className={`size-5 rounded-full ${
                newColor === color ? "ring-2 ring-zinc-950 ring-offset-1 dark:ring-zinc-50" : ""
              }`}
              style={{ backgroundColor: color }}
            >
              <span className="sr-only">{color}</span>
            </button>
          ))}
        </div>
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCreate();
            }
          }}
          placeholder="New tag name"
          className="h-8"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isCreating || !newName.trim()}
          onClick={handleCreate}
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Create tag</span>
        </Button>
      </div>
    </div>
  );
}
