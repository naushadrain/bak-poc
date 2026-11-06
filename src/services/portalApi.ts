export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Without an estate code this is the base endpoint, with one it's the parameterized endpoint. */
function buildUrl(resource: string, estate_code?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
  if (!baseUrl) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
  const url = `${baseUrl}/${resource}`;
  return estate_code ? `${url}/${encodeURIComponent(estate_code)}` : url;
}

/** Accepts a plain array, a Data API Builder `{ value: [...] }` envelope, or a single row. */
function toRows<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  if (body !== null && typeof body === "object") {
    const { value } = body as { value?: unknown };
    return Array.isArray(value) ? (value as T[]) : [body as T];
  }
  throw new ApiError("The API returned an unexpected response.");
}

export async function fetchPortalRows<T>(
  resource: string,
  estate_code: string | undefined,
  signal: AbortSignal,
): Promise<T[]> {
  const response = await fetch(buildUrl(resource, estate_code), {
    headers: { Accept: "application/json" },
    signal,
  });

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
