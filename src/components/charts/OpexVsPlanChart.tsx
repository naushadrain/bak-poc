"use client";

import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatAedFromMillions, formatSignedPercent } from "@/lib/format";
import { getFinanceRows, isNumber, type FinanceRow } from "@/lib/portfolio";
import type { Finance } from "@/models/interfaces";
import { ChartLegend, EstateBarChart, type EstateBarSeries } from "./EstateBarChart";

const SERIES: EstateBarSeries<FinanceRow>[] = [
  { key: "actualM", label: "Actual", color: "var(--ink)" },
  { key: "planM", label: "Plan", color: "var(--taupe)" },
];

const TABLE_COLUMNS: DataTableColumn<FinanceRow>[] = [
  { key: "estate", header: "Estate", value: (row) => row.estate_code },
  { key: "actual", header: "Actual", value: (row) => formatAedFromMillions(row.actualM), align: "right" },
  { key: "plan", header: "Plan", value: (row) => formatAedFromMillions(row.planM), align: "right" },
  {
    key: "variance",
    header: "Variance",
    value: (row) => (isNumber(row.variancePct) ? formatSignedPercent(row.variancePct) : "—"),
    align: "right",
  },
];

interface OpexVsPlanChartProps {
  finance: PortalDataState<Finance>;
  /** Pages that already list these figures in a table can turn this off. */
  showTable?: boolean;
}

export function OpexVsPlanChart({ finance, showTable = true }: OpexVsPlanChartProps) {
  const rows = getFinanceRows(finance.data);

  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <SectionHeader
        title="OPEX vs Plan"
        subtitle="Year to date, by estate"
        corner={<ChartLegend items={SERIES} />}
      />

      {finance.isLoading ? (
        <SkeletonLoader className="h-80" label="Loading OPEX chart" />
      ) : finance.error ? (
        <ErrorMessage error={finance.error}>The OPEX chart is unavailable. {finance.error.message}</ErrorMessage>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink2">No estate data was returned.</p>
      ) : (
        <>
          <EstateBarChart rows={rows} series={SERIES} formatValue={formatAedFromMillions} />
          <p className="text-xs text-ink2">
            AED millions. Plan is calculated from each estate&apos;s reported OPEX and variance.
          </p>
          {showTable && (
            <details className="text-sm">
              <summary className="cursor-pointer text-xs font-medium text-ink2 hover:text-ink">
                View as table
              </summary>
              <DataTable
                label="OPEX vs plan"
                columns={TABLE_COLUMNS}
                rows={rows}
                getRowKey={(row) => row.estate_code}
                searchPlaceholder="Search estates"
                className="mt-3 shadow-none"
              />
            </details>
          )}
        </>
      )}
    </Card>
  );
}
