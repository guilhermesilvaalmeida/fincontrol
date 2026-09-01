"use client";

import Link from "next/link";
import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { CreditCard } from "@/types/finance";

export function FutureInstallmentsCard() {
  const { data: cards, isLoading } = useSWR<CreditCard[]>("/api/credit-cards", api.get);

  if (isLoading) return <Skeleton className="h-24" />;

  const totalCommitted = (cards ?? []).reduce((sum, c) => sum + c.committedAmount, 0);

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Parcelas futuras (cartões)</p>
      <Money value={totalCommitted} tone={totalCommitted > 0 ? "negative" : "default"} className="mt-2 block text-xl font-semibold" />
      {!cards || cards.length === 0 ? (
        <p className="mt-1 text-xs text-ink-400">Nenhum cartão cadastrado ainda.</p>
      ) : (
        <Link href="/credit-cards" className="mt-1 inline-block text-xs font-medium text-emerald hover:underline">
          Ver cartões
        </Link>
      )}
    </Card>
  );
}
