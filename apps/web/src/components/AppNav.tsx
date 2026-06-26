import Link from "next/link";
import { Logo } from "@/components/Logo";

interface AppNavProps {
  userLabel?: string | null;
  backHref?: string;
  backLabel?: string;
}

export function AppNav({ userLabel, backHref, backLabel }: AppNavProps) {
  return (
    <header className="border-b border-foam bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {backHref ? (
          <Link href={backHref} className="text-sm font-medium text-ocean hover:text-ocean-dark transition-colors">
            ← {backLabel ?? "Back"}
          </Link>
        ) : (
          <Logo size="sm" />
        )}
        {userLabel ? (
          <span className="text-sm text-slate truncate max-w-[140px]">{userLabel}</span>
        ) : null}
      </div>
    </header>
  );
}
