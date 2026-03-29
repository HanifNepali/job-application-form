interface StepHeaderProps {
  title: string;
  description: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-3xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-md text-ink-secondary">{description}</p>
      <hr className="my-8 border-line" />
    </div>
  );
}
