"use client";

import type { Projects } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useProjectsData(estate_code?: string) {
  return usePortalData<Projects>("projects", estate_code);
}
