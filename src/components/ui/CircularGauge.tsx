import { getStatus, STATUS_LABELS } from "@/lib/status";
import { cn } from "@/lib/utils";
import {
  HEALTH_THRESHOLDS,
  type StatusLevel,
  type StatusThresholds,
} from "@/models/constants/thresholds";
import { Badge } from "./Badge";

const STROKES: Record<StatusLevel, string> = {
  good: "stroke-good",
  warn: "stroke-warn",
  crit: "stroke-crit",
};

const VIEW_BOX = 100;
const STROKE_WIDTH = 9;
const RADIUS = (VIEW_BOX - STROKE_WIDTH) / 2;
const CENTER = VIEW_BOX / 2;

const valueFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

interface CircularGaugeProps {
  /** A 0-100 value where higher is better. Null shows a no-data state. */
  value: number | null | undefined;
  label: string;
  unit?: string;
  thresholds?: StatusThresholds;
  className?: string;
}

export function CircularGauge({
  value,
  label,
  unit = "%",
  thresholds = HEALTH_THRESHOLDS,
  className,
}: CircularGaugeProps) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value);
  const status = hasValue ? getStatus(value, thresholds) : null;
  const filled = hasValue ? Math.min(Math.max(value, 0), 100) : 0;
  const description = hasValue
    ? `${label}: ${valueFormat.format(value)}${unit}, ${STATUS_LABELS[status!]}`
    : `${label}: no data`;

  return (
    <figure className={cn("flex w-40 flex-col items-center gap-2", className)}>
      <svg
        viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
        role="img"
        aria-label={description}
        className="w-full"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-ink/10"
        />
        {status && filled > 0 && (
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${filled} 100`}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className={cn(
              "transition-[stroke-dasharray] duration-500 motion-reduce:transition-none",
              STROKES[status],
            )}
          />
        )}
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-ink text-[20px] font-semibold tabular-nums"
        >
          {hasValue ? valueFormat.format(value) : "—"}
          {hasValue && (
            <tspan className="fill-ink2 text-[11px] font-normal" dx="1">
              {unit}
            </tspan>
          )}
        </text>
      </svg>
      <figcaption className="flex flex-col items-center gap-1.5 text-center text-sm text-ink2">
        {label}
        {status && <Badge variant={status}>{STATUS_LABELS[status]}</Badge>}
      </figcaption>
    </figure>
  );
}
