import { X } from "lucide-react";

interface ChipListProps {
  title: string;
  items: string[];
  onRemove: (item: string) => void;
  emptyMessage?: string;
}

export function ChipList({
  title,
  items,
  onRemove,
  emptyMessage = "No skills added yet",
}: ChipListProps) {
  return (
    <div>
      <h3 className="mb-2 text-md font-medium text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item}`}
                className="text-ink-muted hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
