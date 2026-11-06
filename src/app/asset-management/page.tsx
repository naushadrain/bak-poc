"use client";

import { PageHero } from "@/components/ui/PageHero";
import { Tabs } from "@/components/ui/Tabs";
import { LifecycleOverview } from "@/components/widgets/LifecycleOverview";
import { StrategicPlan } from "@/components/widgets/StrategicPlan";
import { useAssetData } from "@/controllers/hooks/useAssetData";

export default function AssetManagementPage() {
  const assets = useAssetData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero eyebrow="Asset management" title="Asset lifecycle and strategy" />
      <Tabs
        label="Asset management views"
        tabs={[
          { id: "lifecycle", label: "Lifecycle Overview", content: <LifecycleOverview assets={assets} /> },
          { id: "strategy", label: "Strategic Plan", content: <StrategicPlan /> },
        ]}
      />
    </div>
  );
}
