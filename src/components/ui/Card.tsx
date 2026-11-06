import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-lg border border-ink/10 bg-paper p-5 shadow-sm", className)}
      {...props}
    />
  );
}
