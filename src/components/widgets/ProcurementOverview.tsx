"use client";

import Link from "next/link";
import { ChartLegend, EstateBarChart, type EstateBarSeries } from "@/components/charts/EstateBarChart";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { KpiGrid, KpiTile } from "@/components/ui/KpiTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatAedFromMillions, formatCount } from "@/lib/format";
import { isNumber, splitPortfolio, sumOf } from "@/lib/portfolio";
import type { Approvals, Procurement } from "@/models/interfaces";

const NO_VALUE = "—";

const SERIES: EstateBarSeries<Procurement>[] = [
  { key: "pipeline_aed_m", label: "Pipeline", color: "var(--ink)" },
  { key: "awarded_ytd_aed_m", label: "Awarded YTD", color: "var(--taupe)" },
];

const COLUMNS: DataTableColumn<Procurement>[] = [
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
  { key: "pipeline", header: "Pipeline", value: (row) => formatAedFromMillions(row.pipeline_aed_m), align: "right" },
  { key: "gates", header: "Live tenders", value: (row) => row.gates_live, align: "right" },
  { key: "awarded", header: "Awarded YTD", value: (row) => formatAedFromMillions(row.awarded_ytd_aed_m), align: "right" },
];

function ApprovalList({ approvals }: { approvals: PortalDataState<Approvals> }) {
  // The API sorts by name, and the part after the colon is the document class.
  const items = (approvals.data ?? []).map((row) => ({
    id: row.kpi_name,
    documentClass: row.kpi_name.split(":")[1] ?? row.kpi_name,
    state: row.value,
  }));

  if (approvals.isLoading) return <SkeletonLoader lines={4} className="h-6" label="Loading approvals" />;
  if (approvals.error) {
    return <ErrorMessage error={approvals.error}>Approvals are unavailable. {approvals.error.message}</ErrorMessage>;
  }
  if (items.length === 0) return <p className="text-sm text-ink2">No approvals were returned.</p>;

  return (
    <dl className="divide-y divide-line">
      {items.map(({ id, documentClass, state }) => (
        <div key={id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <dt className="text-ink2">{documentClass}</dt>
          <dd>
            {state === "Approved" ? (
              <Badge variant="good">{state}</Badge>
            ) : (
              <span className="inline-block rounded-full border border-ink/20 bg-stone px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink">
                {state}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface ProcurementOverviewProps {
  procurement: PortalDataState<Procurement>;
  approvals: PortalDataState<Approvals>;
}

export function ProcurementOverview({ procurement, approvals }: ProcurementOverviewProps) {
  const { portfolio, estates } = splitPortfolio(procurement.data);
  const rows = [...estates].sort((a, b) => b.pipeline_aed_m - a.pipeline_aed_m);
  const pipeline = portfolio?.pipeline_aed_m ?? sumOf(estates, (row) => row.pipeline_aed_m);
  const gates = portfolio?.gates_live ?? sumOf(estates, (row) => row.gates_live);
  const awarded = portfolio?.awarded_ytd_aed_m ?? sumOf(estates, (row) => row.awarded_ytd_aed_m);
  const withLiveTenders = estates.filter((row) => row.gates_live > 0).length;

  return (
    <div className="space-y-6">
      <KpiGrid label="Procurement totals">
        <KpiTile
          label="Tender Pipeline"
          state={procurement}
          value={isNumber(pipeline) ? formatAedFromMillions(pipeline) : NO_VALUE}
          detail="Value of active tenders"
        />
        <KpiTile
          label="Live Tenders"
          state={procurement}
          value={isNumber(gates) ? formatCount(gates) : NO_VALUE}
          detail="At gates 1 to 13"
        />
        <KpiTile
          label="Estates with Live Tenders"
          state={procurement}
          value={estates.length > 0 ? `${withLiveTenders} of ${estates.length}` : NO_VALUE}
          detail="At least one tender in progress"
        />
        <KpiTile
          label="Awarded YTD"
          state={procurement}
          value={isNumber(awarded) ? formatAedFromMillions(awarded) : NO_VALUE}
          detail="This financial year"
        />
      </KpiGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="flex min-w-0 flex-col gap-4 xl:col-span-2">
          <SectionHeader
            title="Pipeline and Awards by Estate"
            subtitle="Largest pipeline first"
            corner={<ChartLegend items={SERIES} />}
          />
          {procurement.isLoading ? (
            <SkeletonLoader className="h-80" label="Loading procurement chart" />
          ) : procurement.error ? (
            <ErrorMessage error={procurement.error}>
              The procurement chart is unavailable. {procurement.error.message}
            </ErrorMessage>
          ) : rows.length === 0 ? (
            <p className="text-sm text-ink2">No estate data was returned.</p>
          ) : (
            <>
              <EstateBarChart rows={rows} series={SERIES} formatValue={formatAedFromMillions} />
              <p className="text-xs text-ink2">AED millions.</p>
            </>
          )}
        </Card>
        <Card className="flex min-w-0 flex-col gap-3 self-start">
          <SectionHeader title="Approvals" subtitle="Latest status by document class" />
          <ApprovalList approvals={approvals} />
        </Card>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Tender Position by Estate" subtitle="Select an estate to open it" />
        {!procurement.error && (
          <DataTable
            label="Tender position by estate"
            columns={COLUMNS}
            rows={rows}
            getRowKey={(row) => row.estate_code}
            isLoading={procurement.isLoading}
            searchPlaceholder="Search estates"
            emptyMessage="No estate data was returned."
            scrollClassName="max-h-[32rem]"
          />
        )}
      </div>
    </div>
  );
}
