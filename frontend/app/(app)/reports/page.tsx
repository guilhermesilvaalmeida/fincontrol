"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { EvolutionChart } from "@/components/reports/EvolutionChart";
import { CategoryComparisonList } from "@/components/reports/CategoryComparisonList";
import { TopExpensesList } from "@/components/reports/TopExpensesList";
import { api } from "@/lib/api";
import type { ReportsResponse } from "@/types/finance";

export default function ReportsPage() {
  const { data, isLoading } = useSWR<ReportsResponse>("/api/reports", api.get);

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">Relatórios</h1>
        <p className="text-sm text-ink-400">Uma visão completa da sua vida financeira este mês.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-ink-400">Receitas</p>
          <Money value={data.currentMonthIncome} tone="positive" className="mt-1 block text-lg font-semibold" />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Despesas</p>
          <Money value={data.currentMonthExpense} tone="negative" className="mt-1 block text-lg font-semibold" />
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink-400">Economia</p>
          <span className="mt-1 block font-mono text-lg font-semibold">{data.currentMonthSavingsRate.toFixed(1)}%</span>
        </Card>
      </div>

      <EvolutionChart data={data.monthlyEvolution} />
      <CategoryComparisonList data={data.categoryComparison} />
      <TopExpensesList data={data.topExpenses} />
    </div>
  );
}
