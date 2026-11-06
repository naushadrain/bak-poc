"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { KpiGrid, KpiTile } from "@/components/ui/KpiTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { PortalDataState } from "@/controllers/hooks/usePortalData";
import { formatCount } from "@/lib/format";
import { isNumber, splitPortfolio, sumOf } from "@/lib/portfolio";
import { cn } from "@/lib/utils";
import { PROJECT_STAGES } from "@/models/constants/projectStages";
import type { Projects, ProjectsByStage } from "@/models/interfaces";

const NO_VALUE = "—";

/** Links come from API data, so only web addresses are allowed. Returns the address and file name. */
function parsePhotoLink(url: string | null) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return { href: parsed.href, name: decodeURIComponent(parsed.pathname.split("/").pop() ?? "") || "Photo" };
  } catch {
    return null;
  }
}

const COLUMNS: DataTableColumn<Projects>[] = [
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
  { key: "active", header: "Active projects", value: (row) => row.projects_active, align: "right" },
  {
    key: "photo",
    header: "Latest progress photo",
    value: (row) => parsePhotoLink(row.progress_photo_url)?.name,
    render: (row) => {
      const photo = parsePhotoLink(row.progress_photo_url);
      if (!photo) return <span className="text-ink2">No photo</span>;
      return (
        <a
          href={photo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:underline"
        >
          {photo.name}
          <ExternalLink aria-hidden="true" className="size-3.5 shrink-0 text-ink2" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      );
    },
  },
];

function getStageCounts(rows: ProjectsByStage[] | null) {
  const counts = new Map(
    (rows ?? []).map((row) => [row.kpi_name.split(":")[1] ?? row.kpi_name, Number(row.value)]),
  );
  // The API sorts stages by name, so put them back in gate order. A stage this
  // list doesn't know yet still shows, after the known ones.
  const unknown = [...counts.keys()].filter((stage) => !PROJECT_STAGES.includes(stage));
  return [...PROJECT_STAGES, ...unknown].map((stage) => ({
    stage,
    count: counts.get(stage) ?? 0,
  }));
}

function StagePipeline({ stages }: { stages: { stage: string; count: number }[] }) {
  return (
    <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
      {stages.map(({ stage, count }, index) => (
        <li key={stage} className="flex flex-col gap-1 bg-paper p-3">
          <span aria-hidden="true" className={cn("mb-1 h-1 rounded-full", count > 0 ? "bg-ink" : "bg-line")} />
          <span className="text-[11px] text-ink2 tabular-nums">Stage {index + 1}</span>
          <span className="font-display text-2xl text-ink tabular-nums">{count}</span>
          <span className="text-xs text-ink2">{stage}</span>
        </li>
      ))}
    </ol>
  );
}

interface ProjectsOverviewProps {
  projects: PortalDataState<Projects>;
  stages: PortalDataState<ProjectsByStage>;
}

export function ProjectsOverview({ projects, stages }: ProjectsOverviewProps) {
  const { portfolio, estates } = splitPortfolio(projects.data);
  const rows = [...estates].sort(
    (a, b) => b.projects_active - a.projects_active || a.estate_code.localeCompare(b.estate_code),
  );
  const active = portfolio?.projects_active ?? sumOf(estates, (row) => row.projects_active);
  const withActive = estates.filter((row) => row.projects_active > 0).length;
  const withPhoto = estates.filter((row) => parsePhotoLink(row.progress_photo_url)).length;
  const stageCounts = getStageCounts(stages.data);
  const stageTotal = stageCounts.reduce((total, { count }) => total + count, 0);
  const isStageTotalDifferent =
    !projects.isLoading && !projects.error && !stages.error && isNumber(active) && stageTotal !== active;

  return (
    <div className="space-y-6">
      <KpiGrid label="Project totals">
        <KpiTile
          label="Active Projects"
          state={projects}
          value={isNumber(active) ? formatCount(active) : NO_VALUE}
          detail="Not closed or cancelled"
        />
        <KpiTile
          label="Estates with Projects"
          state={projects}
          value={estates.length > 0 ? `${withActive} of ${estates.length}` : NO_VALUE}
          detail="At least one active project"
        />
        <KpiTile
          label="Tracked in Stages"
          state={stages}
          value={formatCount(stageTotal)}
          detail="Projects with a stage recorded"
        />
        <KpiTile
          label="Progress Photos"
          state={projects}
          value={estates.length > 0 ? `${withPhoto} of ${estates.length}` : NO_VALUE}
          detail="Estates with a latest photo"
        />
      </KpiGrid>

      <Card className="flex min-w-0 flex-col gap-4">
        <SectionHeader title="Projects by Stage" subtitle="Portfolio, in capital gate order" />
        {stages.isLoading ? (
          <SkeletonLoader className="h-40" label="Loading project stages" />
        ) : stages.error ? (
          <ErrorMessage error={stages.error}>Project stages are unavailable. {stages.error.message}</ErrorMessage>
        ) : (stages.data ?? []).length === 0 ? (
          <p className="text-sm text-ink2">No project stages were returned.</p>
        ) : (
          <>
            <StagePipeline stages={stageCounts} />
            {isStageTotalDifferent && (
              <p className="text-xs text-ink2">
                Stages account for {stageTotal} of {active} active projects. The two figures come from
                separate API views.
              </p>
            )}
          </>
        )}
      </Card>

      <div className="space-y-3">
        <SectionHeader title="Projects by Estate" subtitle="Select an estate to open it" />
        {projects.error ? (
          <ErrorMessage error={projects.error}>Project data is unavailable. {projects.error.message}</ErrorMessage>
        ) : (
          <DataTable
            label="Projects by estate"
            columns={COLUMNS}
            rows={rows}
            getRowKey={(row) => row.estate_code}
            isLoading={projects.isLoading}
            searchPlaceholder="Search estates or photos"
            emptyMessage="No estate data was returned."
            scrollClassName="max-h-[32rem]"
          />
        )}
      </div>
    </div>
  );
}
