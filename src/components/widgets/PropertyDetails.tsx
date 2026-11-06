"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useAssetData } from "@/controllers/hooks/useAssetData";
import { useEstateDimData } from "@/controllers/hooks/useEstateDimData";
import { useFinanceData } from "@/controllers/hooks/useFinanceData";
import { useHRData } from "@/controllers/hooks/useHRData";
import { useInvisibleCareData } from "@/controllers/hooks/useInvisibleCareData";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { useServiceDeliveryData } from "@/controllers/hooks/useServiceDeliveryData";
import { getSeverity } from "@/lib/attention";
import {
  formatAedMillions,
  formatCount,
  formatPercent,
  formatScore,
  formatSignedPercent,
} from "@/lib/format";
import { findEstateRow, isNumber } from "@/lib/portfolio";
import { STATUS_LABELS } from "@/lib/status";
import { ATTENTION_LIMITS } from "@/models/constants/thresholds";
import { ApiError } from "@/services/portalApi";

function isNotFoundError(error: Error | null) {
  return error instanceof ApiError && error.status === 404;
}

function isForbiddenError(error: Error | null) {
  return error instanceof ApiError && error.status === 403;
}

function show(value: number | null | undefined, format: (value: number) => string) {
  return isNumber(value) ? format(value) : "—";
}

function SeverityBadge({ value, limits }: { value: unknown; limits: { warn: number; crit: number } }) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const severity = getSeverity(value, limits);
  return severity && <Badge variant={severity}>{STATUS_LABELS[severity]}</Badge>;
}

interface Metric {
  label: string;
  value: string;
  badge?: ReactNode;
}

interface MetricCardProps {
  title: string;
  subtitle: string;
  isLoading: boolean;
  error: Error | null;
  hasRow: boolean;
  metrics: Metric[];
}

function MetricCard({ title, subtitle, isLoading, error, hasRow, metrics }: MetricCardProps) {
  return (
    <Card className="flex min-w-0 flex-col gap-3">
      <SectionHeader title={title} subtitle={subtitle} />
      {isLoading ? (
        <SkeletonLoader lines={3} className="h-6" label={`Loading ${title}`} />
      ) : error && !isNotFoundError(error) ? (
        <ErrorMessage error={error}>{title} data is unavailable. {error.message}</ErrorMessage>
      ) : !hasRow ? (
        <p className="text-sm text-ink2">No {title.toLowerCase()} data for this estate.</p>
      ) : (
        <dl className="divide-y divide-line">
          {metrics.map(({ label, value, badge }) => (
            <div key={label} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
              <dt className="text-ink2">{label}</dt>
              <dd className="flex items-center gap-2 font-medium text-ink tabular-nums">
                {badge}
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

function AssetNotFound({ estate_code }: { estate_code: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
        <SearchX aria-hidden="true" className="size-10 text-taupe" />
        <h2 className="font-display text-2xl font-normal text-ink">Asset Not Found</h2>
        <p className="text-sm wrap-break-word text-ink2">
          We couldn&apos;t find an estate with the code{" "}
          <span className="font-medium text-ink">{estate_code}</span>. Check the code, or that you
          have access to this estate.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink2"
        >
          Back to Home
        </Link>
      </Card>
    </div>
  );
}

export function PropertyDetails({ estate_code }: { estate_code: string }) {
  const finance = useFinanceData(estate_code);
  const serviceDelivery = useServiceDeliveryData(estate_code);
  const assets = useAssetData(estate_code);
  const hr = useHRData(estate_code);
  const invisibleCare = useInvisibleCareData(estate_code);
  const estateDim = useEstateDimData(estate_code);

  const financeRow = findEstateRow(finance.data, estate_code);
  const serviceRow = findEstateRow(serviceDelivery.data, estate_code);
  const assetRow = findEstateRow(assets.data, estate_code);
  const hrRow = findEstateRow(hr.data, estate_code);
  const careRow = findEstateRow(invisibleCare.data, estate_code);
  const dimRow = findEstateRow(estateDim.data, estate_code);

  // The estate lookup is left out because it only adds the emirate. One view having
  // no row is a gap in one card, so the estate is only missing if every view agrees.
  // The API answers an unknown code with no rows. A view the role can't read has no
  // say, because a permission denial doesn't mean the estate is missing.
  const coreStates: PortalDataState<unknown>[] = [finance, serviceDelivery, assets, hr, invisibleCare];
  const hasAnyRow = Boolean(financeRow || serviceRow || assetRow || hrRow || careRow);
  const allSettled = coreStates.every((state) => !state.isLoading);
  const readableStates = coreStates.filter((state) => !isForbiddenError(state.error));
  const isMissing =
    allSettled &&
    !hasAnyRow &&
    readableStates.length > 0 &&
    readableStates.every((state) => !state.error || isNotFoundError(state.error));

  if (isMissing) return <AssetNotFound estate_code={estate_code} />;

  // Holds every card in its loading state until an estate is confirmed, so an
  // unknown code doesn't flash "no data" cards before the not-found page.
  const isConfirming = !allSettled && !hasAnyRow;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.18em] text-ink2 uppercase">Estate</p>
          <h2 className="mt-1 font-display text-3xl font-normal wrap-break-word text-ink sm:text-4xl">
            {dimRow?.estate_code ?? assetRow?.estate_code ?? estate_code}
          </h2>
          <div className="mt-1 text-sm text-ink2">
            {estateDim.isLoading ? (
              <SkeletonLoader className="h-4 w-24" label="Loading emirate" />
            ) : (
              (dimRow?.emirate ?? "Emirate unavailable")
            )}
          </div>
        </div>
        {isConfirming || assets.isLoading ? (
          <SkeletonLoader className="size-32 rounded-full" label="Loading Asset Health Index" />
        ) : (
          <CircularGauge
            value={assetRow?.asset_health_idx}
            label="Asset Health Index"
            unit="/100"
            className="w-36"
          />
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard
          title="Financial"
          subtitle="OPEX and CAPEX, year to date"
          isLoading={isConfirming || finance.isLoading}
          error={finance.error}
          hasRow={financeRow !== null}
          metrics={[
            { label: "OPEX (YTD)", value: show(financeRow?.opex_ytd_aed, formatAedMillions) },
            {
              label: "OPEX vs plan",
              value: show(financeRow?.opex_var_pct, formatSignedPercent),
              badge: <SeverityBadge value={financeRow?.opex_var_pct} limits={ATTENTION_LIMITS.opexVariancePct} />,
            },
            { label: "CAPEX committed", value: show(financeRow?.capex_committed_aed, formatAedMillions) },
          ]}
        />
        <MetricCard
          title="Operational"
          subtitle="Staff deployment (HR)"
          isLoading={isConfirming || hr.isLoading}
          error={hr.error}
          hasRow={hrRow !== null}
          metrics={[
            { label: "Staff deployed", value: show(hrRow?.staff_deployed, formatCount) },
            { label: "Deployment vs plan", value: show(hrRow?.deployment_vs_plan_pct, formatPercent) },
          ]}
        />
        <MetricCard
          title="Maintenance"
          subtitle="CAFM work orders"
          isLoading={isConfirming || serviceDelivery.isLoading}
          error={serviceDelivery.error}
          hasRow={serviceRow !== null}
          metrics={[
            { label: "Open work orders", value: show(serviceRow?.open_orders, formatCount) },
            { label: "Backlog aged over 30 days", value: show(serviceRow?.backlog_aged_30d, formatCount) },
            { label: "SLA achievement", value: show(serviceRow?.sla_pct, formatPercent) },
            { label: "PPM completion", value: show(serviceRow?.ppm_completion_pct, formatPercent) },
            { label: "Average response", value: show(serviceRow?.avg_response_min, (v) => `${formatScore(v)} min`) },
            { label: "Mean time to repair", value: show(serviceRow?.mttr_hours, (v) => `${formatScore(v)} hours`) },
          ]}
        />
        <MetricCard
          title="Environmental"
          subtitle="Temperature and alerts"
          isLoading={isConfirming || invisibleCare.isLoading}
          error={invisibleCare.error}
          hasRow={careRow !== null}
          metrics={[
            { label: "Average temperature", value: show(careRow?.avg_temp_c, (v) => `${formatScore(v)} °C`) },
            {
              label: "Open alerts",
              value: show(careRow?.env_alerts_open, formatCount),
              badge: <SeverityBadge value={careRow?.env_alerts_open} limits={ATTENTION_LIMITS.envAlertsOpen} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
