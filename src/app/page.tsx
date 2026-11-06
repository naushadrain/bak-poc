"use client";

import { OpexVsPlanChart } from "@/components/charts/OpexVsPlanChart";
import { PageHero } from "@/components/ui/PageHero";
import { AssetLeaderboard } from "@/components/widgets/AssetLeaderboard";
import { AttentionPanel } from "@/components/widgets/AttentionPanel";
import { KpiStrip } from "@/components/widgets/KpiStrip";
import { useAssetData } from "@/controllers/hooks/useAssetData";
import { useFinanceData } from "@/controllers/hooks/useFinanceData";
import { useHSEData } from "@/controllers/hooks/useHSEData";
import { useInvisibleCareData } from "@/controllers/hooks/useInvisibleCareData";
import { useServiceDeliveryData } from "@/controllers/hooks/useServiceDeliveryData";

export default function HomePage() {
  const finance = useFinanceData();
  const serviceDelivery = useServiceDeliveryData();
  const assets = useAssetData();
  const hse = useHSEData();
  const invisibleCare = useInvisibleCareData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero eyebrow="Portfolio overview" title="One portfolio. Complete visibility." />
      <KpiStrip finance={finance} serviceDelivery={serviceDelivery} assets={assets} hse={hse} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <AttentionPanel finance={finance} invisibleCare={invisibleCare} />
          <OpexVsPlanChart finance={finance} />
        </div>
        <div className="min-w-0">
          <AssetLeaderboard assets={assets} />
        </div>
      </div>
    </div>
  );
}
