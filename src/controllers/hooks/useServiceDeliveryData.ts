"use client";

import type { ServiceDelivery } from "@/models/interfaces";
import { usePortalData } from "./usePortalData";

export function useServiceDeliveryData(estate_code?: string) {
  return usePortalData<ServiceDelivery>("service_delivery", estate_code);
}
