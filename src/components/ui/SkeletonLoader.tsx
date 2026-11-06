import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  /** Number of placeholder bars. */
  lines?: number;
  /** Sets the size and shape of each bar, for example "h-40" or "size-24 rounded-full". */
  className?: string;
  /** Read out by screen readers. */
  label?: string;
}

export function SkeletonLoader({
  lines = 1,
  className,
  label = "Loading",
}: SkeletonLoaderProps) {
  return (
    <div role="status" className="space-y-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn(
            "h-4 animate-pulse rounded-md bg-ink/10 motion-reduce:animate-none",
            // A shorter last line reads as a paragraph of text.
            lines > 1 && index === lines - 1 && "w-2/3",
            className,
          )}
        />
      ))}
    </div>
  );
}
