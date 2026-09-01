"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { PeriodSelector, type DashboardPeriod } from "@/components/dashboard/PeriodSelector";
import { Avatar } from "@/components/ui/Avatar";
import type { DashboardResponse } from "@/types/finance";
import type { UserSummary } from "@/types/auth";

function formatPeriodLabel(period: DashboardPeriod, start: string, end: string) {
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");

  switch (period) {
    case "DAY":
      return startDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    case "WEEK":
      return `${startDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${endDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;
    case "YEAR":
      return startDate.toLocaleDateString("pt-BR", { year: "numeric" });
    case "MONTH":
    default:
      return startDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("MONTH");

  const { data, isLoading } = useSWR<DashboardResponse>(`/api/dashboard?period=${period}`, api.get);
  const { data: user } = useSWR<UserSummary>("/api/auth/me", api.get);

  const periodLabel = data ? formatPeriodLabel(period, data.periodStart, data.periodEnd) : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink dark:text-white">
            Olá{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm capitalize text-ink-400">{periodLabel}</p>
        </div>
        <Link href="/transactions/new" className="hidden md:block">
          <Button>+ Adicionar gasto</Button>
        </Link>
        <Link href="/profile" className="md:hidden">
          <Avatar name={user?.name ?? "?"} src={user?.avatar} />
        </Link>
      </div>

      <PeriodSelector value={period} onChange={setPeriod} />

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          <SummaryCards data={data} />
          <ExpenseChart data={data.expensesByCategory} />
          <RecentTransactions items={data.recentTransactions} />
        </>
      )}

      <Link
        href="/transactions/new"
        className="fixed bottom-20 right-4 z-20 flex items-center gap-2 rounded-full bg-emerald px-5 py-3.5 text-sm font-semibold text-white shadow-card md:hidden"
      >
        + Adicionar gasto
      </Link>
    </div>
  );
}
