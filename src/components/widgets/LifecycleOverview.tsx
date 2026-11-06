"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { KpiTile } from "@/components/widgets/KpiStrip";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatAedMillions, formatCount, formatPercent, formatScore } from "@/lib/format";
import { getPortfolioHealth, isNumber, splitPortfolio } from "@/lib/portfolio";
import { getStatus, STATUS_LABELS } from "@/lib/status";
import type { AssetMgmt } from "@/models/interfaces";

const NO_VALUE = "—";

function show(value: number | null | undefined, format: (value: number) => string) {
  return isNumber(value) ? format(value) : NO_VALUE;
}

function sumOf(rows: AssetMgmt[], pick: (row: AssetMgmt) => number | null) {
  const values = rows.map(pick).filter(isNumber);
  return values.length > 0 ? values.reduce((total, value) => total + value, 0) : null;
}

const COLUMNS: DataTableColumn<AssetMgmt>[] = [
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
  { key: "assets", header: "Assets", value: (row) => row.asset_count, render: (row) => show(row.asset_count, formatCount), align: "right" },
  { key: "health", header: "Health", value: (row) => row.asset_health_idx, render: (row) => show(row.asset_health_idx, formatScore), align: "right" },
  {
    key: "status",
    header: "Status",
    value: (row) => (isNumber(row.asset_health_idx) ? STATUS_LABELS[getStatus(row.asset_health_idx)] : null),
    render: (row) => {
      if (!isNumber(row.asset_health_idx)) return NO_VALUE;
      const status = getStatus(row.asset_health_idx);
      return <Badge variant={status}>{STATUS_LABELS[status]}</Badge>;
    },
  },
  { key: "beyond", header: "Beyond design life", value: (row) => row.assets_beyond_life, render: (row) => show(row.assets_beyond_life, formatCount), align: "right" },
];

function EstateDetail({ row, totalAssets }: { row: AssetMgmt; totalAssets: number | null }) {
  const details = [
    {
      label: "Share of portfolio assets",
      value: isNumber(row.asset_count) && totalAssets ? formatPercent((row.asset_count / totalAssets) * 100) : NO_VALUE,
    },
    {
      label: "Assets beyond design life",
      value:
        isNumber(row.assets_beyond_life) && row.asset_count
          ? formatPercent((row.assets_beyond_life / row.asset_count) * 100)
          : NO_VALUE,
    },
    { label: "Spares value", value: show(row.spares_value_aed_m, (value) => formatAedMillions(value * 1_000_000)) },
  ];

  return (
    <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
      {details.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs text-ink2">{label}</dt>
          <dd className="font-medium text-ink tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LifecycleOverview({ assets }: { assets: PortalDataState<AssetMgmt> }) {
  const { portfolio, estates } = splitPortfolio(assets.data);
  const totalAssets = portfolio?.asset_count ?? sumOf(estates, (row) => row.asset_count);
  const beyondLife = portfolio?.assets_beyond_life ?? sumOf(estates, (row) => row.assets_beyond_life);
  const health = getPortfolioHealth(assets.data);
  const healthStatus = isNumber(health) ? getStatus(health) : null;
  const rows = [...estates].sort((a, b) => (b.asset_count ?? 0) - (a.asset_count ?? 0));

  return (
    <div className="space-y-6">
      <section aria-label="Asset totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Total Assets" state={assets} value={show(totalAssets, formatCount)} detail="Active assets across the portfolio" />
        <KpiTile
          label="Asset Health"
          state={assets}
          value={isNumber(health) ? `${formatScore(health)} / 100` : NO_VALUE}
          detail={healthStatus && <Badge variant={healthStatus}>{STATUS_LABELS[healthStatus]}</Badge>}
        />
        <KpiTile label="Beyond Design Life" state={assets} value={show(beyondLife, formatCount)} detail="Age over expected life" />
        <KpiTile
          label="Spares Value"
          state={assets}
          value={show(portfolio?.spares_value_aed_m, (value) => formatAedMillions(value * 1_000_000))}
          detail="Portfolio stock on hand"
        />
      </section>

      {assets.error ? (
        <ErrorMessage>Estate asset data is unavailable. {assets.error.message}</ErrorMessage>
      ) : (
        <DataTable
          label="Assets by estate"
          columns={COLUMNS}
          rows={rows}
          getRowKey={(row) => row.estate_code}
          isLoading={assets.isLoading}
          searchPlaceholder="Search estates"
          emptyMessage="No estate data was returned."
          scrollClassName="max-h-[32rem]"
          renderExpanded={(row) => <EstateDetail row={row} totalAssets={totalAssets} />}
        />
      )}
    </div>
  );
}
