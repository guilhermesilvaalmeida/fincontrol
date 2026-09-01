"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { CreditCard, InstallmentPurchase } from "@/types/finance";

export default function CreditCardDetailPage() {
  const params = useParams<{ id: string }>();

  const { data: cards, isLoading: loadingCards } = useSWR<CreditCard[]>("/api/credit-cards", (url: string) => api.get(url));
  const { data: purchases, isLoading: loadingPurchases } = useSWR<InstallmentPurchase[]>(
    "/api/installment-purchases",
    (url: string) => api.get(url)
  );

  const card = cards?.find((c) => c.id === params.id);
  const cardPurchases = (purchases ?? []).filter((p) => p.creditCardId === params.id);
  const usedPercent = card && card.creditLimit > 0 ? Math.min(100, (card.committedAmount / card.creditLimit) * 100) : 0;

  if (loadingCards) {
    return <Skeleton className="h-40" />;
  }

  if (!card) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-ink-400">Cartão não encontrado.</p>
        <Link href="/credit-cards" className="text-sm font-medium text-emerald hover:underline">
          Voltar para cartões
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/credit-cards" className="text-sm text-ink-400 hover:underline">
          ‹ Cartões
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold text-ink dark:text-white">{card.name}</h1>
        {card.bank && <p className="text-sm text-ink-400">{card.bank}</p>}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
          <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${usedPercent}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-ink-400">Limite</p>
            <Money value={card.creditLimit} tone="muted" className="text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Comprometido</p>
            <Money value={card.committedAmount} className="text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Disponível</p>
            <Money value={card.availableLimit} tone="positive" className="text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Fecha / Vence</p>
            <p className="text-lg font-semibold">
              {card.closingDay} / {card.dueDay}
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-white">Compras parceladas</h2>

        {loadingPurchases ? (
          <Skeleton className="h-24" />
        ) : cardPurchases.length === 0 ? (
          <Card className="py-8 text-center text-sm text-ink-400">Nenhuma compra parcelada neste cartão ainda.</Card>
        ) : (
          <div className="flex flex-col gap-3">
            {cardPurchases.map((purchase) => (
              <Card key={purchase.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink dark:text-white">{purchase.description}</p>
                    <p className="text-xs text-ink-400">
                      {purchase.installmentsCount}x de {purchase.installmentAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <Money value={purchase.totalAmount} className="font-semibold" />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {purchase.installments.map((item) => (
                    <span
                      key={item.number}
                      className="rounded-lg bg-ink-50 px-2.5 py-1 text-xs text-ink-700 dark:bg-white/5 dark:text-white/70"
                    >
                      {item.number}/{purchase.installmentsCount} ·{" "}
                      {new Date(item.dueOn + "T00:00:00").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
