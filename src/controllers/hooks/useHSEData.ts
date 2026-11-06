"use client";

import type { HSE } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useHSEData(estate_code?: string) {
  return usePortalData<HSE>("vw_hse", estate_code);
}
