"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { buildAttentionItems } from "@/lib/attention";
import { splitPortfolio } from "@/lib/portfolio";
import { STATUS_LABELS } from "@/lib/status";
import { cn } from "@/lib/utils";
import { ATTENTION_LIMITS } from "@/models/constants/thresholds";
import type { Finance, InvisibleCare } from "@/models/interfaces";

/** Explains a check that couldn't run, or null if its data arrived. */
function getSkippedCheck<T extends { estate_code: string }>(
  name: string,
  { data, error }: PortalDataState<T>,
) {
  if (error) return { error, message: `${name} check didn't run. ${error.message}` };
  if (splitPortfolio(data).estates.length === 0) {
    return { error: null, message: `${name} check didn't run. No estate data was returned.` };
  }
  return null;
}

interface AttentionPanelProps {
  finance: PortalDataState<Finance>;
  invisibleCare: PortalDataState<InvisibleCare>;
}

export function AttentionPanel({ finance, invisibleCare }: AttentionPanelProps) {
  const isLoading = finance.isLoading || invisibleCare.isLoading;
  const items = isLoading ? [] : buildAttentionItems(finance.data, invisibleCare.data);
  const skippedChecks = isLoading
    ? []
    : [
        getSkippedCheck("OPEX variance", finance),
        getSkippedCheck("Environmental alerts", invisibleCare),
      ].filter((check) => check !== null);
  const hasCritical = items.some((item) => item.severity === "crit");

  return (
    <Card
      className={cn(
        "border-l-4",
        !isLoading && items.length > 0 && (hasCritical ? "border-l-crit" : "border-l-warn"),
      )}
    >
      <div className="mb-3">
        <SectionHeader
          title="Attention"
          subtitle={`OPEX more than ${ATTENTION_LIMITS.opexVariancePct.warn}% over plan, or open environmental alerts`}
        />
      </div>

      {isLoading ? (
        <SkeletonLoader lines={3} label="Loading attention items" />
      ) : (
        <div className="space-y-3">
          {skippedChecks.map(({ error, message }) => (
            <ErrorMessage key={message} error={error}>
              {message}
            </ErrorMessage>
          ))}
          {items.length > 0 && (
            <ul className="divide-y divide-line">
              {items.map(({ id, estate_code, severity, message }) => (
                <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <Badge variant={severity}>{STATUS_LABELS[severity]}</Badge>
                  <Link
                    href={`/property/${encodeURIComponent(estate_code)}`}
                    className="text-sm font-medium text-ink hover:underline"
                  >
                    {estate_code}
                  </Link>
                  <span className="text-sm text-ink2">{message}</span>
                </li>
              ))}
            </ul>
          )}
          {/* Only claim all clear when every check actually ran. */}
          {items.length === 0 && skippedChecks.length === 0 && (
            <Badge variant="good">No estates need attention</Badge>
          )}
        </div>
      )}
    </Card>
  );
}
