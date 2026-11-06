import { ATTENTION_LIMITS, type StatusLevel } from "@/models/constants/thresholds";
import type { Finance, InvisibleCare } from "@/models/interfaces";
import { formatSignedPercent } from "./format";
import { isNumber, splitPortfolio } from "./portfolio";

export interface AttentionItem {
  id: string;
  estate_code: string;
  severity: Extract<StatusLevel, "warn" | "crit">;
  message: string;
}

export function getSeverity(
  value: number,
  limits: { warn: number; crit: number },
): AttentionItem["severity"] | null {
  if (value > limits.crit) return "crit";
  if (value > limits.warn) return "warn";
  return null;
}

/** Checks estate rows only, so the portfolio roll-up doesn't repeat every estate's alerts. */
export function buildAttentionItems(
  finance: Finance[] | null,
  invisibleCare: InvisibleCare[] | null,
): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const { estate_code, opex_var_pct } of splitPortfolio(finance).estates) {
    if (!isNumber(opex_var_pct)) continue;
    const severity = getSeverity(opex_var_pct, ATTENTION_LIMITS.opexVariancePct);
    if (severity) {
      items.push({
        id: `${estate_code}-opex`,
        estate_code,
        severity,
        message: `OPEX ${formatSignedPercent(opex_var_pct)} vs plan YTD`,
      });
    }
  }

  for (const { estate_code, env_alerts_open } of splitPortfolio(invisibleCare).estates) {
    if (!isNumber(env_alerts_open)) continue;
    const severity = getSeverity(env_alerts_open, ATTENTION_LIMITS.envAlertsOpen);
    if (severity) {
      items.push({
        id: `${estate_code}-env`,
        estate_code,
        severity,
        message: `${env_alerts_open} open environmental ${env_alerts_open === 1 ? "alert" : "alerts"}`,
      });
    }
  }

  return items.sort(
    (a, b) =>
      Number(b.severity === "crit") - Number(a.severity === "crit") ||
      a.estate_code.localeCompare(b.estate_code),
  );
}
