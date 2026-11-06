"use client";

import type { SecurityDimEstate } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useEstateDimData(estate_code?: string) {
  return usePortalData<SecurityDimEstate>("security_dim_estate", estate_code);
}
