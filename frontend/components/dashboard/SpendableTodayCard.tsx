"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { DashboardResponse, Goal } from "@/types/finance";

export function SpendableTodayCard() {
  const { data: month, isLoading: loadingMonth } = useSWR<DashboardResponse>("/api/dashboard?period=MONTH", api.get);
  const { data: goals, isLoading: loadingGoals } = useSWR<Goal[]>("/api/goals", api.get);

  if (loadingMonth || loadingGoals || !month) return <Skeleton className="h-32" />;

  const goalsMonthly = (goals ?? []).reduce((sum, g) => sum + (g.completed ? 0 : g.monthlyAmountNeeded ?? 0), 0);
  const available = month.balance - goalsMonthly;

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, lastDay - today.getDate() + 1);
  const perDay = available / daysRemaining;

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Quanto posso gastar?</h2>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <span className="text-ink-400">Recebido este mês</span>
        <Money value={month.totalIncome} className="text-right" />
        <span className="text-ink-400">Já gasto</span>
        <Money value={month.totalExpense} tone="negative" className="text-right" />
        {goalsMonthly > 0 && (
          <>
            <span className="text-ink-400">Reservado p/ metas</span>
            <Money value={goalsMonthly} tone="negative" className="text-right" />
          </>
        )}
      </div>

      <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald/10">
        <p className="text-xs text-emerald-600 dark:text-emerald">Você pode gastar aproximadamente</p>
        <Money value={Math.max(0, perDay)} className="mt-1 block text-2xl font-bold text-emerald-600 dark:text-emerald" />
        <p className="text-xs text-emerald-600 dark:text-emerald">por dia, até o fim do período</p>
      </div>
    </Card>
  );
}
