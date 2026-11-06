import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataDictionary } from "@/components/widgets/DataDictionary";
import { STATUS_LABELS } from "@/lib/status";
import { ATTENTION_LIMITS, HEALTH_THRESHOLDS } from "@/models/constants/thresholds";

const INDEX_COMPONENTS = [
  {
    weight: "40%",
    name: "Environmental",
    description: "IAQ, water quality, humidity stability and fire-system integrity from the sensor network.",
  },
  { weight: "30%", name: "PPM compliance", description: "Rolling 90-day PPM completion." },
  {
    weight: "20%",
    name: "Critical work orders",
    description: "Open priority 1 and 2 work orders, scored against asset count.",
  },
  { weight: "10%", name: "Asset condition", description: "The validated condition index." },
];

const { opexVariancePct, envAlertsOpen } = ATTENTION_LIMITS;

const READING_NOTES = [
  {
    term: "OPEX plan",
    detail: "The API has no plan field, so plan is calculated as OPEX YTD / (1 + OPEX variance % / 100).",
  },
  {
    term: "Portfolio figures",
    detail: "Taken from the PORTFOLIO row when the API returns one. Portfolio PPM completion is calculated across all work orders, so it differs from the average of estates.",
  },
  {
    term: "Attention warnings",
    detail: `OPEX variance above ${opexVariancePct.warn}% or any open environmental alert shows a warning. Variance above ${opexVariancePct.crit}%, or more than ${envAlertsOpen.crit} open alerts, shows as critical.`,
  },
  {
    term: "Access",
    detail: "Allowed roles in the Data Dictionary come from the API integration guide. When the API denies a role, a permission notice replaces the data.",
  },
  {
    term: "Field status",
    detail: "Taken from the source-to-target mapping. Fields marked Partial, Proposed, TBC or Gap may still change.",
  },
];

export default function DefinitionsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero
        eyebrow="Governance"
        title="Definitions and method"
        description="How each figure in this portal is defined, where it comes from and how often it refreshes."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeader
            title="Invisible Care Index"
            subtitle={
              <>
                Shown as Asset Health across this portal (API field{" "}
                <code className="font-mono">asset_health_idx</code>).
              </>
            }
          />
          <p className="rounded-md bg-stone p-3 font-mono text-sm wrap-break-word text-ink">
            Index = 0.40 × Environmental + 0.30 × PPM compliance + 0.20 × Critical work orders + 0.10
            × Asset condition
          </p>
          <dl className="divide-y divide-line">
            {INDEX_COMPONENTS.map(({ weight, name, description }) => (
              <div key={name} className="flex gap-3 py-2 text-sm">
                <dt className="w-10 shrink-0 font-medium text-ink tabular-nums">{weight}</dt>
                <dd className="text-ink2">
                  <span className="font-medium text-ink">{name}.</span> {description}
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink2">
            <Badge variant="good">
              {HEALTH_THRESHOLDS.good}–100 {STATUS_LABELS.good}
            </Badge>
            <Badge variant="warn">
              {HEALTH_THRESHOLDS.warn}–{HEALTH_THRESHOLDS.good - 1} {STATUS_LABELS.warn}
            </Badge>
            <Badge variant="crit">
              Below {HEALTH_THRESHOLDS.warn} {STATUS_LABELS.crit}
            </Badge>
          </div>
          <p className="text-xs text-ink2">
            These weights are provisional. The source-to-target mapping lists them as still to be
            confirmed.
          </p>
        </Card>

        <Card className="space-y-3">
          <SectionHeader title="Reading the Numbers" />
          <dl className="divide-y divide-line">
            {READING_NOTES.map(({ term, detail }) => (
              <div key={term} className="py-2 text-sm">
                <dt className="font-medium text-ink">{term}</dt>
                <dd className="mt-0.5 text-ink2">{detail}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="Data Dictionary"
          subtitle="Every API dataset and its fields, checked against the API's OpenAPI specification. Expand a row to see them."
        />
        <DataDictionary />
      </section>
    </div>
  );
}
