import { categoriesApi as api } from "@/lib/admin/handlers";

export const runtime = "nodejs";
export const GET = api.list;
export const POST = api.create;
