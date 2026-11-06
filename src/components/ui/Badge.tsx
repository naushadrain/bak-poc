import type { ComponentProps } from "react";
import { CircleAlert, CircleCheck, CircleX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusLevel } from "@/models/constants/thresholds";

const VARIANTS: Record<StatusLevel, { container: string; icon: string; Icon: LucideIcon }> = {
  good: { container: "border-good/40 bg-good/15", icon: "text-good", Icon: CircleCheck },
  warn: { container: "border-warn/40 bg-warn/15", icon: "text-warn", Icon: CircleAlert },
  crit: { container: "border-crit/40 bg-crit/15", icon: "text-crit", Icon: CircleX },
};

interface BadgeProps extends ComponentProps<"span"> {
  variant: StatusLevel;
}

// Text stays Ink because amber on Paper is only 3.08:1, too low for small text.
// The icon means status is never shown by color alone.
export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const { container, icon, Icon } = VARIANTS[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink",
        container,
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", icon)} />
      {children}
    </span>
  );
}
