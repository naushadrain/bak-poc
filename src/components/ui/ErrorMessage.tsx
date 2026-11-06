import type { ReactNode } from "react";
import { CircleX } from "lucide-react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-ink2">
      <CircleX aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-crit" />
      <span>{children}</span>
    </p>
  );
}
