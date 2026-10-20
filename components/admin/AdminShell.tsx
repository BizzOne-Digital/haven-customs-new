"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, FileText, FolderTree, Images, Inbox, LayoutDashboard, LogOut, Menu, Package, Settings, Tag, X, ImageIcon } from "lucide-react";
import ToastProvider from "./Toast";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/admin/login";
  }

  const nav = (
    <nav aria-label="Admin" className="flex flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[42px] items-center gap-3 px-3 text-sm font-medium ${active ? "bg-race text-white" : "text-graphite hover:bg-pearl"}`}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-pearl lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="hidden border-r border-cloud bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="border-b border-cloud p-5">
            <Image src="/logo.png" alt="Haven Customs" width={448} height={226} className="h-12 w-auto" />
          </div>
          <div className="flex-1 overflow-y-auto">{nav}</div>
          <div className="border-t border-cloud p-3 text-xs text-steel">
            <p className="truncate px-3 pb-2">{email}</p>
            <Link href="/" target="_blank" className="flex min-h-[38px] items-center gap-2 px-3 hover:text-race"><ExternalLink className="h-4 w-4" aria-hidden /> View site</Link>
            <button onClick={logout} className="flex min-h-[38px] w-full items-center gap-2 px-3 hover:text-race"><LogOut className="h-4 w-4" aria-hidden /> Sign out</button>
          </div>
        </aside>

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-cloud bg-white px-4 lg:hidden">
          <Image src="/logo.png" alt="Haven Customs" width={448} height={226} className="h-10 w-auto" />
          <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle admin menu" className="grid h-11 w-11 place-items-center">
            {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </header>
        {open && (
          <div className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-white lg:hidden">
            {nav}
            <div className="border-t border-cloud p-3 text-sm">
              <Link href="/" className="flex min-h-[42px] items-center gap-2 px-3">View site</Link>
              <button onClick={logout} className="flex min-h-[42px] items-center gap-2 px-3 text-race">Sign out</button>
            </div>
          </div>
        )}

        <main className="min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
