"use client";

import Link from "next/link";
import { useEffect } from "react";

export function QuickActionSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const actions = [
    { href: "/transactions/new?type=EXPENSE", icon: "💸", label: "Nova despesa", desc: "Registre um gasto" },
    { href: "/transactions/new?type=INCOME", icon: "💰", label: "Nova receita", desc: "Registre uma entrada" },
    { href: "/credit-cards/new-purchase", icon: "💳", label: "Compra parcelada", desc: "Divida uma compra em parcelas" },
  ];

  return (
    <div className="fixed inset-0 z-30 md:hidden" role="dialog" aria-modal="true">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface-card p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-card dark:bg-surface-cardDark">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-100 dark:bg-white/10" />
        <div className="flex flex-col gap-1">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-ink-50 dark:hover:bg-white/5"
            >
              <span className="text-2xl" aria-hidden>
                {action.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-ink dark:text-white">{action.label}</p>
                <p className="text-xs text-ink-400">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
