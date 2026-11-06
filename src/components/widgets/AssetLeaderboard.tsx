"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CircularGauge } from "@/components/ui/CircularGauge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatScore } from "@/lib/format";
import { getPortfolioHealth, isNumber, splitPortfolio } from "@/lib/portfolio";
import { getStatus, STATUS_LABELS } from "@/lib/status";
import type { AssetMgmt } from "@/models/interfaces";

/** Healthiest first, with estates that have no score last. */
function rankByHealth(estates: AssetMgmt[]) {
  return [...estates].sort(
    (a, b) =>
      (isNumber(b.asset_health_idx) ? b.asset_health_idx : -Infinity) -
        (isNumber(a.asset_health_idx) ? a.asset_health_idx : -Infinity) ||
      a.estate_code.localeCompare(b.estate_code),
  );
}

export function AssetLeaderboard({ assets }: { assets: PortalDataState<AssetMgmt> }) {
  const ranked = rankByHealth(splitPortfolio(assets.data).estates);

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-ink">Asset Health Leaderboard</h2>

      {assets.isLoading ? (
        <SkeletonLoader lines={8} className="h-7" label="Loading asset health" />
      ) : assets.error ? (
        <ErrorMessage>Asset health is unavailable. {assets.error.message}</ErrorMessage>
      ) : ranked.length === 0 ? (
        <p className="text-sm text-ink2">No estate data was returned.</p>
      ) : (
        <>
          <CircularGauge
            value={getPortfolioHealth(assets.data)}
            label="Portfolio Asset Health Index"
            unit="/100"
            className="self-center"
          />
          <ol className="divide-y divide-ink/10">
            {ranked.map(({ estate_code, asset_health_idx }, index) => {
              const hasScore = isNumber(asset_health_idx);
              const status = hasScore ? getStatus(asset_health_idx) : null;
              return (
                <li key={estate_code} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-5 shrink-0 text-right text-xs text-ink2 tabular-nums">
                    {index + 1}
                  </span>
                  <Link
                    href={`/property/${encodeURIComponent(estate_code)}`}
                    className="min-w-0 flex-1 truncate font-medium text-ink hover:underline"
                  >
                    {estate_code}
                  </Link>
                  <span className="text-ink tabular-nums">
                    {hasScore ? formatScore(asset_health_idx) : "—"}
                  </span>
                  <span className="flex w-20 shrink-0 justify-end">
                    {status && <Badge variant={status}>{STATUS_LABELS[status]}</Badge>}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </Card>
  );
}
