"use client";

import type { ProjectsByStage } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useProjectsByStageData(estate_code?: string) {
  return usePortalData<ProjectsByStage>("vw_projects_by_stage", estate_code);
}
