"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchTags } from "@/lib/api/tags";

const ALL_TAGS = "__all__";

export function TagFilterSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const { data: tags = [] } = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  if (tags.length === 0) return null;

  return (
    <Select
      value={value ?? ALL_TAGS}
      onValueChange={(next: string | null) => onChange(next === ALL_TAGS ? null : next)}
    >
      <SelectTrigger className="w-32">
        <SelectValue>
          {(val: string) =>
            val === ALL_TAGS ? "All tags" : (tags.find((tag) => tag.id === val)?.name ?? "All tags")
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_TAGS}>All tags</SelectItem>
        {tags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
