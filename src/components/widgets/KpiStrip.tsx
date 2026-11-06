"use client";

import { Badge } from "@/components/ui/Badge";
import { KpiGrid, KpiTile } from "@/components/ui/KpiTile";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import {
  formatAedMillions,
  formatCount,
  formatPercent,
  formatScore,
  formatSignedPercent,
} from "@/lib/format";
import { getPortfolioHealth, getPortfolioOpex, isNumber, mean, splitPortfolio } from "@/lib/portfolio";
import { getStatus, STATUS_LABELS } from "@/lib/status";
import type { AssetMgmt, Finance, HSE, ServiceDelivery } from "@/models/interfaces";

const NO_VALUE = "—";

function getPpmCompletion(rows: ServiceDelivery[] | null) {
  const { portfolio, estates } = splitPortfolio(rows);
  // The portfolio figure is calculated across all work orders, so an average of
  // estates only approximates it and has to say so.
  if (portfolio) return { value: portfolio.ppm_completion_pct, isApproximate: false };
  return { value: mean(estates.map((row) => row.ppm_completion_pct)), isApproximate: true };
}

function getLtiFreeDays(rows: HSE[] | null) {
  const { portfolio, estates } = splitPortfolio(rows);
  if (isNumber(portfolio?.lti_free_days)) return portfolio.lti_free_days;
  // The most recent injury anywhere sets the portfolio's count.
  const days = estates.map((row) => row.lti_free_days).filter(isNumber);
  return days.length > 0 ? Math.min(...days) : null;
}

interface KpiStripProps {
  finance: PortalDataState<Finance>;
  serviceDelivery: PortalDataState<ServiceDelivery>;
  assets: PortalDataState<AssetMgmt>;
  hse: PortalDataState<HSE>;
}

export function KpiStrip({ finance, serviceDelivery, assets, hse }: KpiStripProps) {
  const opex = getPortfolioOpex(finance.data);
  const ppm = getPpmCompletion(serviceDelivery.data);
  const health = getPortfolioHealth(assets.data);
  const ltiFreeDays = getLtiFreeDays(hse.data);
  const healthStatus = isNumber(health) ? getStatus(health) : null;

  return (
    <KpiGrid label="Key performance indicators">
      <KpiTile
        label="Total OPEX (YTD)"
        state={finance}
        value={isNumber(opex.total) ? formatAedMillions(opex.total) : NO_VALUE}
        detail={isNumber(opex.variancePct) ? `${formatSignedPercent(opex.variancePct)} vs plan` : "Variance unavailable"}
      />
      <KpiTile
        label="PPM Completion"
        state={serviceDelivery}
        value={isNumber(ppm.value) ? formatPercent(ppm.value) : NO_VALUE}
        detail={ppm.isApproximate ? "Average of estates" : "Rolling 90 days"}
      />
      <KpiTile
        label="Asset Health"
        state={assets}
        value={isNumber(health) ? `${formatScore(health)} / 100` : NO_VALUE}
        detail={healthStatus && <Badge variant={healthStatus}>{STATUS_LABELS[healthStatus]}</Badge>}
      />
      <KpiTile
        label="LTI-free Days"
        state={hse}
        value={isNumber(ltiFreeDays) ? formatCount(ltiFreeDays) : NO_VALUE}
        detail="Since the last lost-time injury"
      />
    </KpiGrid>
  );
}
