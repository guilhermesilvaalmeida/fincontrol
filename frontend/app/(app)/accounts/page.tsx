"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { AccountForm } from "@/components/accounts/AccountForm";
import { api } from "@/lib/api";
import type { Account } from "@/types/finance";

const typeLabels: Record<Account["type"], string> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  WALLET: "Carteira",
  CASH: "Dinheiro",
  INVESTMENT: "Investimento",
  OTHER: "Outros",
};

export default function AccountsPage() {
  const { data: accounts, isLoading, mutate } = useSWR<Account[]>("/api/accounts", api.get);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">Contas</h1>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "+ Nova conta"}</Button>
      </div>

      {showForm && (
        <Card>
          <AccountForm
            onSuccess={() => {
              setShowForm(false);
              mutate();
            }}
          />
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-ink-400">Você ainda não possui contas cadastradas.</p>
          <Button onClick={() => setShowForm(true)}>+ Nova conta</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink dark:text-white">{account.name}</p>
                <p className="text-xs text-ink-400">
                  {typeLabels[account.type]} {account.institution ? `· ${account.institution}` : ""}
                </p>
              </div>
              <Money
                value={account.currentBalance}
                tone={account.currentBalance >= 0 ? "default" : "negative"}
                className="text-lg font-semibold"
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
