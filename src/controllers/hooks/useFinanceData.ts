"use client";

import type { Finance } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useFinanceData(estate_code?: string) {
  return usePortalData<Finance>("vw_finance", estate_code);
}
