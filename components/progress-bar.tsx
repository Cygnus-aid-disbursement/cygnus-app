export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full bg-accent" style={{ width: `${value}%` }} />
    </div>
  );
}
