interface StepHeaderProps {
  title: string;
  description: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-md text-ink-secondary">{description}</p>
      <hr className="mt-10 border-line" />
    </div>
  );
}
