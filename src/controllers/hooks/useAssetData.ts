"use client";

import type { AssetMgmt } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useAssetData(estate_code?: string) {
  return usePortalData<AssetMgmt>("asset_mgmt", estate_code);
}
