import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { zodErrors } from "./validation";

export const ok = <T>(data: T, status = 200) => NextResponse.json({ success: true, ...data }, { status });
export const fail = (error: string, status = 400, fields?: Record<string, string>) =>
  NextResponse.json({ success: false, error, ...(fields ? { fields } : {}) }, { status });

export async function readJson(req: Request, maxBytes = 200_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) throw new HttpError("Request body too large", 413);
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError("Request body too large", 413);
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError("Invalid JSON body", 400);
  }
}

export async function parse<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.infer<S>> {
  return schema.parse(await readJson(req));
}

export class HttpError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) return fail("Please check the highlighted fields", 422, zodErrors(err));
  if (err instanceof HttpError) return fail(err.message, err.status);
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    return fail("That slug or name is already in use", 409, { slug: "Already in use" });
  }
  if (err && typeof err === "object" && (err as { name?: string }).name === "CastError") return fail("Not found", 404);
  console.error(err);
  return fail("Something went wrong. Please try again.", 500);
}
