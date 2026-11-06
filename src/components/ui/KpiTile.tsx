import type { ReactNode } from "react";
import { ErrorMessage } from "./ErrorMessage";
import { SkeletonLoader } from "./SkeletonLoader";

interface KpiGridProps {
  /** Names the group for screen readers. */
  label: string;
  /** Use an even number of tiles, so no empty cell shows in the two-column layout. */
  children: ReactNode;
}

/** Joins its tiles into one strip, with the gap showing through as hairlines. */
export function KpiGrid({ label, children }: KpiGridProps) {
  return (
    <section
      aria-label={label}
      className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 xl:grid-cols-4"
    >
      {children}
    </section>
  );
}

interface KpiTileProps {
  label: string;
  state: { isLoading: boolean; error: Error | null };
  value: string;
  detail: ReactNode;
}

export function KpiTile({ label, state, value, detail }: KpiTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 bg-paper p-5">
      <h3 className="text-[11px] font-normal tracking-wider text-ink2 uppercase">{label}</h3>
      {state.isLoading ? (
        <SkeletonLoader lines={2} className="h-6" label={`Loading ${label}`} />
      ) : state.error ? (
        <ErrorMessage error={state.error}>Unavailable. {state.error.message}</ErrorMessage>
      ) : (
        <>
          <p className="font-display text-3xl text-ink tabular-nums">{value}</p>
          <div className="text-xs text-ink2">{detail}</div>
        </>
      )}
    </div>
  );
}
