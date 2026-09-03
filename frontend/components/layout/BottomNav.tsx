"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import { QuickActionSheet } from "./QuickActionSheet";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { UserSummary } from "@/types/auth";

const links = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/transactions", label: "Gastos", icon: "💸" },
  { href: "/reports", label: "Relatórios", icon: "📊" },
  { href: "/settings", label: "Mais", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showActions, setShowActions] = useState(false);
  const { data: user } = useSWR<UserSummary>("/api/auth/me", api.get);
  const mobileLinks = user?.role === "ADMIN" ? [...links.slice(0, 3), { href: "/admin", label: "Admin", icon: "⚙️" }] : links;

  return (
    <>
      {showActions && <QuickActionSheet onClose={() => setShowActions(false)} />}

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center border-t border-ink-100 bg-surface-card px-1 pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-surface-cardDark md:hidden">
        {mobileLinks.slice(0, 2).map((link) => {
          const active = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/dashboard");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                active ? "text-emerald" : "text-ink-400 dark:text-white/50"
              )}
            >
              <span className="text-lg" aria-hidden>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}

        <button
          onClick={() => setShowActions(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium text-emerald"
        >
          <span className="-mt-1 text-2xl" aria-hidden>
            ➕
          </span>
          Adicionar
        </button>

        {mobileLinks.slice(2).map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                active ? "text-emerald" : "text-ink-400 dark:text-white/50"
              )}
            >
              <span className="text-lg" aria-hidden>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
