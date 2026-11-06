"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatAedMillions, formatSignedPercent } from "@/lib/format";
import { getOpexPlan, isNumber, splitPortfolio } from "@/lib/portfolio";
import type { Finance } from "@/models/interfaces";

const SERIES = [
  { key: "actualM", label: "Actual", color: "var(--ink)" },
  { key: "planM", label: "Plan", color: "var(--taupe)" },
] as const;

const BAR_THICKNESS = 12;
const ROW_HEIGHT = 40;
const AXIS_HEIGHT = 30;
const AXIS_TEXT = { fill: "var(--ink2)", fontSize: 12 };

interface ChartRow {
  estate_code: string;
  actualM: number;
  planM: number | null;
  variancePct: number;
}

function formatMillions(value: number | null) {
  return value === null ? "—" : formatAedMillions(value * 1_000_000);
}

const TABLE_COLUMNS: DataTableColumn<ChartRow>[] = [
  { key: "estate", header: "Estate", value: (row) => row.estate_code },
  { key: "actual", header: "Actual", value: (row) => formatMillions(row.actualM), align: "right" },
  { key: "plan", header: "Plan", value: (row) => formatMillions(row.planM), align: "right" },
  {
    key: "variance",
    header: "Variance",
    value: (row) => (isNumber(row.variancePct) ? formatSignedPercent(row.variancePct) : "—"),
    align: "right",
  },
];

function ChartTooltip({ row }: { row: ChartRow }) {
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3 text-xs shadow-sm">
      <p className="mb-1.5 font-medium text-ink2">{row.estate_code}</p>
      <dl className="space-y-1">
        {SERIES.map((series) => (
          <div key={series.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-3" style={{ backgroundColor: series.color }} />
            <dt className="text-ink2">{series.label}</dt>
            <dd className="ml-auto pl-4 font-semibold text-ink tabular-nums">
              {formatMillions(row[series.key])}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function OpexVsPlanChart({ finance }: { finance: PortalDataState<Finance> }) {
  const rows: ChartRow[] = splitPortfolio(finance.data)
    .estates.filter((row) => isNumber(row.opex_ytd_aed))
    .map((row) => {
      const plan = getOpexPlan(row);
      return {
        estate_code: row.estate_code,
        actualM: row.opex_ytd_aed / 1_000_000,
        planM: plan === null ? null : plan / 1_000_000,
        variancePct: row.opex_var_pct,
      };
    })
    .sort((a, b) => b.actualM - a.actualM);

  return (
    <Card className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div>
          <h2 className="text-base font-semibold text-ink">OPEX vs Plan</h2>
          <p className="text-xs text-ink2">AED millions, year to date, by estate</p>
        </div>
        <ul className="flex gap-4 text-xs text-ink2">
          {SERIES.map((series) => (
            <li key={series.key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: series.color }} />
              {series.label}
            </li>
          ))}
        </ul>
      </div>

      {finance.isLoading ? (
        <SkeletonLoader className="h-80" label="Loading OPEX chart" />
      ) : finance.error ? (
        <ErrorMessage>The OPEX chart is unavailable. {finance.error.message}</ErrorMessage>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink2">No estate data was returned.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + AXIS_HEIGHT}>
            <BarChart
              data={rows}
              layout="vertical"
              barSize={BAR_THICKNESS}
              barGap={2}
              margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid horizontal={false} stroke="var(--ink)" strokeOpacity={0.1} />
              <XAxis
                type="number"
                height={AXIS_HEIGHT}
                axisLine={false}
                tickLine={false}
                tick={AXIS_TEXT}
                tickFormatter={(value: number) => `${value}m`}
              />
              <YAxis
                type="category"
                dataKey="estate_code"
                width={64}
                axisLine={{ stroke: "var(--ink)", strokeOpacity: 0.1 }}
                tickLine={false}
                tick={AXIS_TEXT}
              />
              <Tooltip
                cursor={{ fill: "var(--stone)" }}
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload as ChartRow | undefined;
                  return active && row ? <ChartTooltip row={row} /> : null;
                }}
              />
              {SERIES.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.label}
                  fill={series.color}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-ink2">
            Plan is calculated from each estate&apos;s reported OPEX and variance.
          </p>
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
        </>
      )}
    </Card>
  );
}
