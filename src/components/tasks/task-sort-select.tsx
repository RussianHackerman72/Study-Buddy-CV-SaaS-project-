"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/api/tasks";

const sortLabels: Record<SortOption, string> = {
  createdAt: "Newest first",
  dueDate: "Due date",
  priority: "Priority",
};

export function TaskSortSelect({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as SortOption)}>
      <SelectTrigger className="w-32">
        <SelectValue>{(value: SortOption) => sortLabels[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(sortLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
