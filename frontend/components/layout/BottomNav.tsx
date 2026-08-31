"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/transactions", label: "Gastos", icon: "💸" },
  { href: "/transactions/new", label: "Adicionar", icon: "➕" },
  { href: "/accounts", label: "Contas", icon: "🏦" },
  { href: "/dashboard#mais", label: "Mais", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-ink-100 bg-surface-card px-2 pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-surface-cardDark md:hidden">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/dashboard#mais" && pathname.startsWith(link.href) && link.href !== "/dashboard");
        const isAdd = link.label === "Adicionar";
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium",
              isAdd ? "text-emerald" : active ? "text-emerald" : "text-ink-400 dark:text-white/50"
            )}
          >
            <span className={clsx("text-lg", isAdd && "-mt-1 text-2xl")} aria-hidden>
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
