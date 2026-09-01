"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import clsx from "clsx";
import { logout } from "@/lib/auth";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import type { UserSummary } from "@/types/auth";

const links = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/transactions", label: "Transações", icon: "💸" },
  { href: "/credit-cards", label: "Cartões", icon: "💳" },
  { href: "/accounts", label: "Contas", icon: "🏦" },
  { href: "/budgets", label: "Orçamentos", icon: "🎯" },
  { href: "/goals", label: "Metas", icon: "🏆" },
  { href: "/reports", label: "Relatórios", icon: "📊" },
  { href: "/settings", label: "Configurações", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useSWR<UserSummary>("/api/auth/me", api.get);

  return (
    <aside className="hidden w-60 flex-col border-r border-ink-100 bg-surface-card px-4 py-6 dark:border-white/10 dark:bg-surface-cardDark md:flex">
      <div className="mb-8 px-2">
        <span className="font-display text-lg font-bold text-ink dark:text-white">FinControl</span>
      </div>

      <Link
        href="/profile"
        className="mb-6 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-ink-50 dark:hover:bg-white/5"
      >
        <Avatar name={user?.name ?? "?"} src={user?.avatar} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink dark:text-white">{user?.name ?? "..."}</p>
          <p className="truncate text-xs text-ink-400">Ver perfil</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald/10 dark:text-emerald"
                  : "text-ink-700 hover:bg-ink-50 dark:text-white/70 dark:hover:bg-white/5"
              )}
            >
              <span aria-hidden>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-700 hover:bg-ink-50 dark:text-white/70 dark:hover:bg-white/5"
      >
        <span aria-hidden>🚪</span>
        Sair
      </button>
    </aside>
  );
}
