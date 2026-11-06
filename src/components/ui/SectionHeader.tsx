import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** A short note for the top-right corner, such as the unit. */
  corner?: ReactNode;
}

export function SectionHeader({ title, subtitle, corner }: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
      <div className="min-w-0">
        <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink2">{subtitle}</p>}
      </div>
      {corner && <div className="text-[11px] tracking-wider text-ink2 uppercase">{corner}</div>}
    </div>
  );
}
