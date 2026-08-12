export function TagBadge({
  name,
  color,
  onRemove,
}: {
  name: string;
  color: string;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      {name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <span className="sr-only">Remove {name}</span>×
        </button>
      )}
    </span>
  );
}
