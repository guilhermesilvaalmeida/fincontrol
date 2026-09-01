"use client";

import Link from "next/link";
import useSWR from "swr";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { Budget } from "@/types/finance";

const barColor: Record<Budget["status"], string> = {
  ok: "bg-emerald",
  attention: "bg-gold",
  near_limit: "bg-gold",
  exceeded: "bg-danger",
};

export function BudgetSummaryCard() {
  const { data: budgets, isLoading } = useSWR<Budget[]>("/api/budgets", api.get);

  if (isLoading) return <Skeleton className="h-40" />;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink dark:text-white">Orçamento mensal</h2>
        <Link href="/budgets" className="text-xs font-medium text-emerald hover:underline">
          Ver tudo
        </Link>
      </div>

      {!budgets || budgets.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm text-ink-400">Você ainda não definiu orçamentos por categoria.</p>
          <Link href="/budgets" className="text-sm font-medium text-emerald hover:underline">
            + Criar orçamento
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {budgets.slice(0, 4).map((b) => (
            <div key={b.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink dark:text-white">
                  {b.categoryIcon} {b.categoryName}
                </span>
                <span className="text-ink-400">{b.percentUsed.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
                <div
                  className={clsx("h-full rounded-full transition-all", barColor[b.status])}
                  style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
