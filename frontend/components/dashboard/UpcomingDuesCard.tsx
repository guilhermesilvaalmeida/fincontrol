"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { Transaction } from "@/types/finance";

export function UpcomingDuesCard() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: upcoming, isLoading } = useSWR<Transaction[]>(
    `/api/transactions?type=EXPENSE&from=${today}&sort=oldest`,
    api.get
  );

  if (isLoading) return <Skeleton className="h-48" />;

  const items = (upcoming ?? []).slice(0, 6);

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Próximos vencimentos</h2>

      {items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink-400">Nenhum vencimento futuro registrado.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
          {items.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-lg" aria-hidden>
                  {t.creditCard ? "💳" : t.category?.icon ?? "📦"}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white">{t.description}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(t.occurredOn + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    {t.creditCard ? ` · ${t.creditCard.name}` : ""}
                  </p>
                </div>
              </div>
              <Money value={t.amount} tone="muted" className="text-sm" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
