import {
  HEALTH_THRESHOLDS,
  type StatusLevel,
  type StatusThresholds,
} from "@/models/constants/thresholds";

export const STATUS_LABELS: Record<StatusLevel, string> = {
  good: "Good",
  warn: "Warning",
  crit: "Critical",
};

export function getStatus(
  value: number,
  thresholds: StatusThresholds = HEALTH_THRESHOLDS,
): StatusLevel {
  if (value >= thresholds.good) return "good";
  if (value >= thresholds.warn) return "warn";
  return "crit";
}
