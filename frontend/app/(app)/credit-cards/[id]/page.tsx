"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { CreditCard, Transaction } from "@/types/finance";

function invoiceMonthKey(date: string) {
  return date.slice(0, 7); // "yyyy-MM"
}

function invoiceLabel(key: string) {
  const [year, month] = key.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default function CreditCardDetailPage() {
  const params = useParams<{ id: string }>();

  const { data: cards, isLoading: loadingCards } = useSWR<CreditCard[]>("/api/credit-cards", api.get);
  const { data: transactions, isLoading: loadingTransactions } = useSWR<Transaction[]>(
    `/api/transactions?creditCardId=${params.id}&sort=oldest`,
    api.get
  );

  const card = cards?.find((c) => c.id === params.id);
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

  const today = new Date();
  const currentMonthKey = today.toISOString().slice(0, 7);

  // Agrupa as transações do cartão por mês de vencimento (fatura)
  const invoicesByMonth = new Map<string, Transaction[]>();
  (transactions ?? []).forEach((t) => {
    const key = invoiceMonthKey(t.occurredOn);
    if (!invoicesByMonth.has(key)) invoicesByMonth.set(key, []);
    invoicesByMonth.get(key)!.push(t);
  });

  const sortedMonthKeys = Array.from(invoicesByMonth.keys()).sort();
  const currentInvoice = invoicesByMonth.get(currentMonthKey) ?? [];
  const currentInvoiceTotal = currentInvoice.reduce((sum, t) => sum + t.amount, 0);

  const pastInvoiceKeys = sortedMonthKeys.filter((k) => k < currentMonthKey).reverse();
  const futureInvoiceKeys = sortedMonthKeys.filter((k) => k > currentMonthKey);
  const futureTotal = futureInvoiceKeys.reduce(
    (sum, key) => sum + (invoicesByMonth.get(key) ?? []).reduce((s, t) => s + t.amount, 0),
    0
  );

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
            <p className="text-xs text-ink-400">Limite utilizado</p>
            <Money value={card.committedAmount} className="text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Limite disponível</p>
            <Money value={card.availableLimit} tone="positive" className="text-lg font-semibold" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Fecha dia {card.closingDay} · Vence dia {card.dueDay}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-white">
          Fatura atual · {invoiceLabel(currentMonthKey)}
        </h2>

        {loadingTransactions ? (
          <Skeleton className="h-24" />
        ) : currentInvoice.length === 0 ? (
          <Card className="py-8 text-center text-sm text-ink-400">Nenhuma compra nesta fatura ainda.</Card>
        ) : (
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3 dark:border-white/10">
              <span className="text-sm text-ink-400">Total da fatura</span>
              <Money value={currentInvoiceTotal} className="text-lg font-semibold" />
            </div>
            <ul className="flex flex-col divide-y divide-ink-100 dark:divide-white/10">
              {currentInvoice.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden>{t.category?.icon ?? "📦"}</span>
                    <div>
                      <p className="text-sm font-medium text-ink dark:text-white">{t.description}</p>
                      {t.installmentNumber && t.installmentTotal && (
                        <p className="text-xs text-ink-400">
                          Parcela {t.installmentNumber}/{t.installmentTotal}
                        </p>
                      )}
                    </div>
                  </div>
                  <Money value={t.amount} className="text-sm" />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {futureTotal > 0 && (
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-white">Parcelas futuras</h2>
          <Card className="flex items-center justify-between">
            <span className="text-sm text-ink-400">Total comprometido nos próximos meses</span>
            <Money value={futureTotal} className="text-lg font-semibold" />
          </Card>
        </div>
      )}

      {pastInvoiceKeys.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-ink dark:text-white">Histórico de faturas</h2>
          <Card className="flex flex-col divide-y divide-ink-100 p-0 dark:divide-white/10">
            {pastInvoiceKeys.map((key) => {
              const invoiceTotal = (invoicesByMonth.get(key) ?? []).reduce((s, t) => s + t.amount, 0);
              return (
                <div key={key} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm capitalize text-ink dark:text-white">{invoiceLabel(key)}</span>
                  <Money value={invoiceTotal} tone="muted" className="text-sm" />
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
