"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { api } from "@/lib/api";
import { logout } from "@/lib/auth";
import type { UserSummary } from "@/types/auth";

export default function SettingsPage() {
  const { data: user } = useSWR<UserSummary>("/api/auth/me", api.get);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-xl font-bold text-ink dark:text-white">Configurações</h1>

      <Link href="/profile">
        <Card className="flex items-center gap-3 transition-shadow hover:shadow-lg">
          <Avatar name={user?.name ?? "?"} src={user?.avatar} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink dark:text-white">{user?.name ?? "..."}</p>
            <p className="truncate text-sm text-ink-400">{user?.email ?? ""}</p>
          </div>
          <span className="text-ink-400">›</span>
        </Card>
      </Link>

      <Card>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-400">Aparência</p>
        <ThemeToggle />
      </Card>

      <Card className="flex flex-col divide-y divide-ink-100 p-0 dark:divide-white/10">
        <Link href="/credit-cards" className="flex items-center justify-between px-5 py-4 text-sm font-medium text-ink dark:text-white">
          💳 Cartões de crédito
          <span className="text-ink-400">›</span>
        </Link>
        <Link href="/accounts" className="flex items-center justify-between px-5 py-4 text-sm font-medium text-ink dark:text-white">
          🏦 Contas
          <span className="text-ink-400">›</span>
        </Link>
        <Link href="/budgets" className="flex items-center justify-between px-5 py-4 text-sm font-medium text-ink dark:text-white">
          🎯 Orçamentos
          <span className="text-ink-400">›</span>
        </Link>
        <Link href="/goals" className="flex items-center justify-between px-5 py-4 text-sm font-medium text-ink dark:text-white">
          🏆 Metas
          <span className="text-ink-400">›</span>
        </Link>
      </Card>

      {user?.role === "ADMIN" && (
        <Card className="p-0">
          <Link
            href="/admin"
            className="flex items-center justify-between px-5 py-4 text-sm font-medium text-emerald-600 dark:text-emerald"
          >
            ⚙️ Administração
            <span className="text-ink-400">›</span>
          </Link>
        </Card>
      )}

      <Button variant="danger" onClick={logout} className="w-full">
        Sair da conta
      </Button>
    </div>
  );
}
