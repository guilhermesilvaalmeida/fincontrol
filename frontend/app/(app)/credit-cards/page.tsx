"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CreditCardForm } from "@/components/creditcards/CreditCardForm";
import { CreditCardTile } from "@/components/creditcards/CreditCardTile";
import { InstallmentPurchaseForm } from "@/components/creditcards/InstallmentPurchaseForm";
import { api } from "@/lib/api";
import type { CreditCard } from "@/types/finance";

export default function CreditCardsPage() {
  const { data: cards, isLoading, mutate } = useSWR<CreditCard[]>("/api/credit-cards", (url: string) => api.get(url));
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">Cartões de crédito</h1>
        <div className="flex gap-2">
          {cards && cards.length > 0 && (
            <Button variant="secondary" onClick={() => setShowPurchaseForm((v) => !v)}>
              {showPurchaseForm ? "Cancelar" : "+ Compra parcelada"}
            </Button>
          )}
          <Button onClick={() => setShowCardForm((v) => !v)}>{showCardForm ? "Cancelar" : "+ Novo cartão"}</Button>
        </div>
      </div>

      {showCardForm && (
        <Card>
          <CreditCardForm
            onSuccess={() => {
              setShowCardForm(false);
              mutate();
            }}
          />
        </Card>
      )}

      {showPurchaseForm && (
        <Card>
          <InstallmentPurchaseForm
            onSuccess={() => {
              setShowPurchaseForm(false);
              mutate();
            }}
          />
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !cards || cards.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-ink-400">Você ainda não possui cartões cadastrados.</p>
          <Button onClick={() => setShowCardForm(true)}>+ Novo cartão</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {cards.map((card) => (
            <CreditCardTile key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
