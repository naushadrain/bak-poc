"use client";

import { PageHero } from "@/components/ui/PageHero";
import { ProjectsOverview } from "@/components/widgets/ProjectsOverview";
import { useProjectsByStageData } from "@/controllers/hooks/useProjectsByStageData";
import { useProjectsData } from "@/controllers/hooks/useProjectsData";

export default function ProjectsPage() {
  const projects = useProjectsData();
  const stages = useProjectsByStageData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHero eyebrow="Projects" title="Capital works" />
      <ProjectsOverview projects={projects} stages={stages} />
    </div>
  );
}
