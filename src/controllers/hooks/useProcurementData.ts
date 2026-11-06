"use client";

import type { Procurement } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useProcurementData(estate_code?: string) {
  return usePortalData<Procurement>("vw_procurement", estate_code);
}
