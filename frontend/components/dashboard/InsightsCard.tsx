"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatBRL } from "@/lib/currency";
import { api } from "@/lib/api";
import type { Budget, DashboardResponse, ReportsResponse } from "@/types/finance";

export function InsightsCard() {
  const { data: month, isLoading: loadingMonth } = useSWR<DashboardResponse>("/api/dashboard?period=MONTH", api.get);
  const { data: reports, isLoading: loadingReports } = useSWR<ReportsResponse>("/api/reports", api.get);
  const { data: budgets, isLoading: loadingBudgets } = useSWR<Budget[]>("/api/budgets", api.get);

  if (loadingMonth || loadingReports || loadingBudgets || !month || !reports) {
    return <Skeleton className="h-40" />;
  }

  const insights: string[] = [];

  // Maior variação de categoria vs mês anterior
  const biggestChange = [...reports.categoryComparison]
    .filter((c) => c.previousAmount > 0 && c.currentAmount > 0)
    .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))[0];
  if (biggestChange) {
    const direction = biggestChange.percentChange > 0 ? "a mais" : "a menos";
    insights.push(
      `Você gastou ${Math.abs(biggestChange.percentChange).toFixed(0)}% ${direction} com ${biggestChange.name} que no mês passado.`
    );
  }

  // Maior gasto do mês
  if (month.expensesByCategory.length > 0) {
    const top = month.expensesByCategory[0];
    insights.push(`Seu maior gasto este mês foi com ${top.name} (${formatBRL(top.total)}).`);
  }

  // Situação do orçamento
  if (budgets && budgets.length > 0) {
    const exceeded = budgets.filter((b) => b.status === "exceeded");
    if (exceeded.length > 0) {
      insights.push(
        exceeded.length === 1
          ? `Você ultrapassou o orçamento de ${exceeded[0].categoryName}.`
          : `Você ultrapassou o orçamento em ${exceeded.length} categorias.`
      );
    } else {
      insights.push("Você está dentro do seu orçamento mensal em todas as categorias. ✅");
    }
  }

  // Projeção de economia mantendo o ritmo atual
  const today = new Date();
  const daysElapsed = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  if (daysElapsed >= 3 && month.totalIncome > 0) {
    const projectedBalance = (month.balance / daysElapsed) * daysInMonth;
    if (projectedBalance > 0) {
      insights.push(`Mantendo esse ritmo, você pode economizar aproximadamente ${formatBRL(projectedBalance)} este mês.`);
    }
  }

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">💡 Insights</h2>
      {insights.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">Registre mais transações para começarmos a gerar insights.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {insights.map((text, i) => (
            <li key={i} className="rounded-xl bg-ink-50 px-3.5 py-3 text-sm text-ink-700 dark:bg-white/5 dark:text-white/80">
              {text}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
