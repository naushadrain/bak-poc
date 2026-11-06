"use client";

import { useEffect, useState } from "react";
import { fetchPortalRows } from "@/services/portalApi";

export interface PortalDataState<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

interface SettledRequest<T> {
  requestKey: string;
  data: T[] | null;
  error: Error | null;
}

/** Shared by the per-domain hooks. Fetches when the resource or estate changes. */
export function usePortalData<T>(resource: string, estate_code?: string): PortalDataState<T> {
  const requestKey = `${resource}/${estate_code ?? ""}`;
  const [settled, setSettled] = useState<SettledRequest<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchPortalRows<T>(resource, estate_code, signal).then(
      (data) => {
        if (!signal.aborted) setSettled({ requestKey, data, error: null });
      },
      (cause: unknown) => {
        if (signal.aborted) return;
        const error = cause instanceof Error ? cause : new Error(String(cause));
        setSettled({ requestKey, data: null, error });
      },
    );

    return () => controller.abort();
  }, [requestKey, resource, estate_code]);

  // A result only counts if it belongs to the current request, so one estate's
  // rows are never shown under another while the new request is loading.
  const current = settled?.requestKey === requestKey ? settled : null;

  return {
    data: current?.data ?? null,
    isLoading: current === null,
    error: current?.error ?? null,
  };
}
