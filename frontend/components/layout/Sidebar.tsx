"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { logout } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/transactions", label: "Transações", icon: "💸" },
  { href: "/credit-cards", label: "Cartões", icon: "💳" },
  { href: "/accounts", label: "Contas", icon: "🏦" },
  { href: "/settings", label: "Configurações", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-col border-r border-ink-100 bg-surface-card px-4 py-6 dark:border-white/10 dark:bg-surface-cardDark md:flex">
      <div className="mb-8 px-2">
        <span className="font-display text-lg font-bold text-ink dark:text-white">FinControl</span>
      </div>

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
