"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

type Toast = { id: number; kind: "success" | "error"; text: string };
const Ctx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export const useToast = () => {
  const push = useContext(Ctx);
  return { success: (t: string) => push("success", t), error: (t: string) => push("error", t) };
};

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, kind, text }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), kind === "error" ? 7000 : 3500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 border-l-4 bg-white px-4 py-3 text-sm shadow-lg ${t.kind === "error" ? "border-race" : "border-emerald-600"}`}
          >
            {t.kind === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-race" aria-hidden /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />}
            <p className="flex-1 text-ink">{t.text}</p>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss" className="text-steel hover:text-ink">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
