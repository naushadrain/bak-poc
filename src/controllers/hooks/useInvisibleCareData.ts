"use client";

import type { InvisibleCare } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useInvisibleCareData(estate_code?: string) {
  return usePortalData<InvisibleCare>("vw_invisible_care", estate_code);
}
