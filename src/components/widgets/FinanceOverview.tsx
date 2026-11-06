"use client";

import Link from "next/link";
import { OpexVarianceChart } from "@/components/charts/OpexVarianceChart";
import { OpexVsPlanChart } from "@/components/charts/OpexVsPlanChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { KpiGrid, KpiTile } from "@/components/ui/KpiTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { getSeverity } from "@/lib/attention";
import { formatAedFromMillions, formatAedMillions, formatSignedPercent } from "@/lib/format";
import {
  getFinanceRows,
  getPortfolioOpex,
  isNumber,
  splitPortfolio,
  sumOf,
  type FinanceRow,
} from "@/lib/portfolio";
import { STATUS_LABELS } from "@/lib/status";
import { ATTENTION_LIMITS } from "@/models/constants/thresholds";
import type { Finance } from "@/models/interfaces";

const NO_VALUE = "—";
const LIMITS = ATTENTION_LIMITS.opexVariancePct;

const COLUMNS: DataTableColumn<FinanceRow>[] = [
  {
    key: "estate",
    header: "Estate",
    value: (row) => row.estate_code,
    render: (row) => (
      <Link href={`/property/${encodeURIComponent(row.estate_code)}`} className="font-medium hover:underline">
        {row.estate_code}
      </Link>
    ),
  },
  { key: "actual", header: "OPEX YTD", value: (row) => formatAedFromMillions(row.actualM), align: "right" },
  { key: "plan", header: "Plan YTD", value: (row) => formatAedFromMillions(row.planM), align: "right" },
  {
    key: "variance",
    header: "Variance",
    value: (row) => (isNumber(row.variancePct) ? formatSignedPercent(row.variancePct) : null),
    align: "right",
  },
  {
    key: "status",
    header: "Status",
    value: (row) => {
      const severity = isNumber(row.variancePct) ? getSeverity(row.variancePct, LIMITS) : null;
      return severity ? STATUS_LABELS[severity] : null;
    },
    render: (row) => {
      const severity = isNumber(row.variancePct) ? getSeverity(row.variancePct, LIMITS) : null;
      return severity ? <Badge variant={severity}>{STATUS_LABELS[severity]}</Badge> : "Within limit";
    },
  },
  { key: "capex", header: "CAPEX committed", value: (row) => formatAedFromMillions(row.capexM), align: "right" },
];

export function FinanceOverview({ finance }: { finance: PortalDataState<Finance> }) {
  const { portfolio, estates } = splitPortfolio(finance.data);
  const rows = getFinanceRows(finance.data);
  const opex = getPortfolioOpex(finance.data);
  const plan =
    isNumber(opex.total) && isNumber(opex.variancePct) ? opex.total / (1 + opex.variancePct / 100) : null;
  const capex = portfolio?.capex_committed_aed ?? sumOf(estates, (row) => row.capex_committed_aed);
  const overLimit = rows.filter(
    (row) => isNumber(row.variancePct) && getSeverity(row.variancePct, LIMITS),
  ).length;

  return (
    <div className="space-y-6">
      <KpiGrid label="Finance totals">
        <KpiTile
          label="OPEX YTD"
          state={finance}
          value={isNumber(opex.total) ? formatAedMillions(opex.total) : NO_VALUE}
          detail="Actual spend, year to date"
        />
        <KpiTile
          label="Plan YTD"
          state={finance}
          value={isNumber(plan) ? formatAedMillions(plan) : NO_VALUE}
          detail="Calculated from reported variance"
        />
        <KpiTile
          label="Variance vs Plan"
          state={finance}
          value={isNumber(opex.variancePct) ? formatSignedPercent(opex.variancePct) : NO_VALUE}
          detail={`${overLimit} of ${rows.length} estates over the ${LIMITS.warn}% limit`}
        />
        <KpiTile
          label="CAPEX Committed"
          state={finance}
          value={isNumber(capex) ? formatAedMillions(capex) : NO_VALUE}
          detail="Committed purchase orders"
        />
      </KpiGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <OpexVsPlanChart finance={finance} showTable={false} />
        <Card className="flex min-w-0 flex-col gap-4">
          <SectionHeader title="Variance by Estate" subtitle="OPEX against plan, most over plan first" />
          {finance.isLoading ? (
            <SkeletonLoader className="h-80" label="Loading variance chart" />
          ) : finance.error ? (
            <ErrorMessage error={finance.error}>The variance chart is unavailable. {finance.error.message}</ErrorMessage>
          ) : rows.length === 0 ? (
            <p className="text-sm text-ink2">No estate data was returned.</p>
          ) : (
            <OpexVarianceChart rows={rows} />
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Financial Position by Estate" subtitle="Select an estate to open it" />
        {!finance.error && (
          <DataTable
            label="Financial position by estate"
            columns={COLUMNS}
            rows={rows}
            getRowKey={(row) => row.estate_code}
            isLoading={finance.isLoading}
            searchPlaceholder="Search estates"
            emptyMessage="No estate data was returned."
            scrollClassName="max-h-[32rem]"
          />
        )}
      </div>
    </div>
  );
}
