import { ArrowUpRight } from "lucide-react";

export default function Arrow({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <ArrowUpRight aria-hidden strokeWidth={2.5} className={className} />;
}
