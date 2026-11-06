export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Without an estate code this reads the whole entity, with one it filters to that estate. */
function buildUrl(entity: string, estate_code?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
  const url = `${baseUrl}/${entity}`;
  if (!estate_code) return url;
  // Estate codes come from the URL, and OData escapes a quote by doubling it.
  const filter = `estate_code eq '${estate_code.replace(/'/g, "''")}'`;
  return `${url}?$filter=${encodeURIComponent(filter)}`;
}

/** Data API Builder wraps rows in `{ value: [...] }`. */
function toRows<T>(body: unknown): T[] {
  const value = (body as { value?: unknown } | null)?.value;
  if (Array.isArray(value)) return value as T[];
  throw new ApiError("The API returned an unexpected response.");
}

export async function fetchPortalRows<T>(
  entity: string,
  estate_code: string | undefined,
  signal: AbortSignal,
): Promise<T[]> {
  const role = process.env.NEXT_PUBLIC_API_ROLE;
  if (!role) {
    throw new ApiError("NEXT_PUBLIC_API_ROLE is not configured.");
  }

  const response = await fetch(buildUrl(entity, estate_code), {
    headers: { Accept: "application/json", "X-MS-API-ROLE": role },
    // Rows are filtered per user and tenant, so they must never be reused from a cache.
    cache: "no-store",
    signal,
  });

  if (response.status === 403) {
    throw new ApiError("Your role doesn't have access to this data.", 403);
  }
  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    if (signal.aborted) throw cause;
    throw new ApiError("The API returned an unexpected response.", response.status);
  }
  return toRows<T>(body);
}
