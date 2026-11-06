"use client";

import type { Procurement } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useProcurementData(estate_code?: string) {
  return usePortalData<Procurement>("procurement", estate_code);
}
