"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { AdminForbiddenState } from "@/components/admin/AdminForbiddenState";
import { api, ApiError } from "@/lib/api";
import type { AdminDashboard } from "@/types/admin";

const statCards = [
  { key: "totalUsers", label: "Total de usuários", icon: "👥" },
  { key: "activeUsers", label: "Usuários ativos", icon: "🟢" },
  { key: "inactiveUsers", label: "Usuários inativos", icon: "🔴" },
  { key: "totalTransactions", label: "Transações cadastradas", icon: "💰" },
  { key: "totalCreditCards", label: "Cartões cadastrados", icon: "💳" },
  { key: "totalAccounts", label: "Contas cadastradas", icon: "🏦" },
] as const;

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useSWR<AdminDashboard>("/api/admin/dashboard", api.get);

  if (error instanceof ApiError && error.status === 403) {
    return <AdminForbiddenState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">⚙️ Administração</h1>
        <p className="text-sm text-ink-400">Visão geral do FinControl.</p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {statCards.map((stat) => (
              <Card key={stat.key} className="p-4">
                <span className="text-xl" aria-hidden>
                  {stat.icon}
                </span>
                <p className="mt-2 font-mono text-2xl font-bold text-ink dark:text-white">{data[stat.key]}</p>
                <p className="text-xs text-ink-400">{stat.label}</p>
              </Card>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink dark:text-white">
                Usuários cadastrados recentemente
              </h2>
              <Link href="/admin/users" className="text-sm font-medium text-emerald hover:underline">
                Ver todos
              </Link>
            </div>

            <Card className="flex flex-col divide-y divide-ink-100 p-0 dark:divide-white/10">
              {data.recentUsers.length === 0 ? (
                <p className="p-5 text-center text-sm text-ink-400">Nenhum usuário cadastrado ainda.</p>
              ) : (
                data.recentUsers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/admin/users/${u.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-ink-50 dark:hover:bg-white/5"
                  >
                    <Avatar name={u.name} src={u.avatar} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink dark:text-white">{u.name}</p>
                      <p className="truncate text-xs text-ink-400">{u.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-ink-400">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                          u.role === "ADMIN"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald/10 dark:text-emerald"
                            : "bg-ink-50 text-ink-400 dark:bg-white/5"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
