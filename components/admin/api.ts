"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number, public fields: Record<string, string> = {}) {
    super(message);
  }
}

/** JSON fetch for admin APIs. Throws ApiError with field errors on failure. */
export async function api<T = Record<string, unknown>>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok || json.success === false) throw new ApiError(json.error ?? `Request failed (${res.status})`, res.status, json.fields);
  return json as T;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
