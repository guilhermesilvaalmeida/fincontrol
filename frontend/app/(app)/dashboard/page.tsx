"use client";

import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import type { DashboardResponse } from "@/types/finance";
import type { UserSummary } from "@/types/auth";

const monthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardResponse>(
  "/api/dashboard",
  (url: string) => api.get<DashboardResponse>(url)
);

  const { data: user } = useSWR<UserSummary>(
  "/api/auth/me",
  (url: string) => api.get<UserSummary>(url)
);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink dark:text-white">
            Olá{user ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-sm capitalize text-ink-400">{monthLabel}</p>
        </div>
        <Link href="/transactions/new" className="hidden md:block">
          <Button>+ Adicionar gasto</Button>
        </Link>
      </div>

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
