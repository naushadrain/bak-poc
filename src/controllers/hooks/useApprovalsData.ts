"use client";

import type { Approvals } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useApprovalsData(estate_code?: string) {
  return usePortalData<Approvals>("vw_approvals", estate_code);
}
