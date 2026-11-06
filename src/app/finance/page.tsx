"use client";

import { PageHero } from "@/components/ui/PageHero";
import { FinanceOverview } from "@/components/widgets/FinanceOverview";
import { useFinanceData } from "@/controllers/hooks/useFinanceData";

export default function FinancePage() {
  const finance = useFinanceData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero eyebrow="Finance" title="Portfolio financial performance" />
      <FinanceOverview finance={finance} />
    </div>
  );
}
