import type { ReactNode } from "react";
import { CircleX, Lock } from "lucide-react";
import { ApiError } from "@/services/portalApi";

interface ErrorMessageProps {
  /** The error being explained. A permission denial is shown as a notice, not a failure. */
  error?: Error | null;
  children: ReactNode;
}

export function ErrorMessage({ error, children }: ErrorMessageProps) {
  const isForbidden = error instanceof ApiError && error.status === 403;
  const Icon = isForbidden ? Lock : CircleX;

  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-ink2">
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${isForbidden ? "text-taupe" : "text-crit"}`} />
      <span>{children}</span>
    </p>
  );
}
