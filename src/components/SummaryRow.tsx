import { isValueEmpty } from "@/lib/utils";

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <dt className="w-50 shrink-0 text-base text-ink-muted">{label}</dt>
      <dd className="text-base text-ink">
        {isValueEmpty(value) ? (
          <span className="text-sm text-ink-muted italic">Not provided</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
