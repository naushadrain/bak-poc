"use client";

import { PageHero } from "@/components/ui/PageHero";
import { ProcurementOverview } from "@/components/widgets/ProcurementOverview";
import { useApprovalsData } from "@/controllers/hooks/useApprovalsData";
import { useProcurementData } from "@/controllers/hooks/useProcurementData";

export default function ProcurementPage() {
  const procurement = useProcurementData();
  const approvals = useApprovalsData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero eyebrow="Procurement" title="Tender pipeline" />
      <ProcurementOverview procurement={procurement} approvals={approvals} />
    </div>
  );
}
