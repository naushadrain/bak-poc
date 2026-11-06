"use client";

import { Tabs } from "@/components/ui/Tabs";
import { LifecycleOverview } from "@/components/widgets/LifecycleOverview";
import { StrategicPlan } from "@/components/widgets/StrategicPlan";
import { useAssetData } from "@/controllers/hooks/useAssetData";

export default function AssetManagementPage() {
  const assets = useAssetData();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
