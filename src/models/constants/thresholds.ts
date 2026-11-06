export type StatusLevel = "good" | "warn" | "crit";

/** Lowest value for each band, where higher is better. */
export interface StatusThresholds {
  good: number;
  warn: number;
}

/** From the prototype's portfolio health bands. */
export const HEALTH_THRESHOLDS: StatusThresholds = { good: 90, warn: 80 };

/** Attention triggers when a value goes above these limits. */
export const ATTENTION_LIMITS = {
  opexVariancePct: { warn: 5, crit: 10 },
  envAlertsOpen: { warn: 0, crit: 4 },
};
