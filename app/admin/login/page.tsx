import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage() {
  const admin = await getAdmin().catch(() => null);
  if (admin) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(110deg,#ffffff_0%,#f1f1f2_55%,#e4e5e7_100%)] px-4">
      <div className="w-full max-w-sm border border-cloud bg-white p-8 shadow-sm">
        <Image src="/logo.png" alt="Haven Customs" width={448} height={226} className="mx-auto h-16 w-auto" priority />
        <h1 className="heading mt-6 text-center text-3xl">Admin sign in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
