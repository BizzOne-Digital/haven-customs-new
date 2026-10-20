import { productsApi as api } from "@/lib/admin/handlers";

export const runtime = "nodejs";
export const GET = api.get;
export const PUT = api.update;
export const PATCH = api.patch;
export const DELETE = api.remove;
