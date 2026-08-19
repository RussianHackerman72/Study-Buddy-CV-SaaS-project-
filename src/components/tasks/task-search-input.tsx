"use client";

import { SearchIcon, XIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TaskSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tasks..."
        className="pl-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-0.5 right-1"
          onClick={() => onChange("")}
        >
          <XIcon className="size-3.5" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
