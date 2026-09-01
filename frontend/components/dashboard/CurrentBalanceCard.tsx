"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { Account } from "@/types/finance";

export function CurrentBalanceCard() {
  const { data: accounts, isLoading } = useSWR<Account[]>("/api/accounts", api.get);

  if (isLoading) return <Skeleton className="h-20" />;

  const total = (accounts ?? []).reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <Card className="overflow-hidden bg-ink text-white dark:bg-ink-900">
      <p className="text-xs font-medium uppercase tracking-wide text-white/60">Saldo atual (todas as contas)</p>
      <Money value={total} className="mt-2 block truncate text-2xl font-bold text-white" />
      {(!accounts || accounts.length === 0) && (
        <p className="mt-1 text-xs text-white/50">Cadastre uma conta para acompanhar seu saldo real.</p>
      )}
    </Card>
  );
}
