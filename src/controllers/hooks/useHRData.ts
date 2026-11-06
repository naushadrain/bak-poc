"use client";

import type { HR } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useHRData(estate_code?: string) {
  return usePortalData<HR>("hr", estate_code);
}
