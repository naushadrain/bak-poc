"use client";

import type { Sustainability } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useSustainabilityData(estate_code?: string) {
  return usePortalData<Sustainability>("vw_sustainability", estate_code);
}
