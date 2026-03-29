import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

interface SummarySectionProps {
  title: string;
  editPath?: string;
  children: React.ReactNode;
  allowEdit?: boolean;
}

export function SummarySection({
  title,
  editPath,
  allowEdit = true,
  children,
}: SummarySectionProps) {
  return (
    <section className="rounded-lg border border-line p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-ink mb-2">
          {title}
        </h2>
        {allowEdit && editPath && (
          <Link
            to={editPath}
            className="text-md text-ink font-medium hover:underline"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        )}
      </div>
      <dl className="space-y-2">{children}</dl>
    </section>
  );
}
