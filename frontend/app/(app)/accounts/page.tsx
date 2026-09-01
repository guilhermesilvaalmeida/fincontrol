"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { Skeleton } from "@/components/ui/Skeleton";
import { AccountForm } from "@/components/accounts/AccountForm";
import { api } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
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
  const { data: accounts, isLoading } = useSWR<Account[]>("/api/accounts", api.get);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta conta? As transações associadas continuam no histórico.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/api/accounts/${id}`);
      revalidateAll();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">Contas</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setShowCreateForm((v) => !v);
          }}
        >
          {showCreateForm ? "Cancelar" : "+ Nova conta"}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <AccountForm onSuccess={() => setShowCreateForm(false)} />
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
          <Button onClick={() => setShowCreateForm(true)}>+ Nova conta</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {accounts.map((account) =>
            editingId === account.id ? (
              <Card key={account.id}>
                <AccountForm account={account} onSuccess={() => setEditingId(null)} />
                <button
                  onClick={() => setEditingId(null)}
                  className="mt-3 w-full text-center text-sm text-ink-400 hover:underline"
                >
                  Cancelar
                </button>
              </Card>
            ) : (
              <Card key={account.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink dark:text-white">{account.name}</p>
                  <p className="text-xs text-ink-400">
                    {typeLabels[account.type]} {account.institution ? `· ${account.institution}` : ""}
                  </p>
                  <Money
                    value={account.currentBalance}
                    tone={account.currentBalance >= 0 ? "default" : "negative"}
                    className="mt-1 block text-lg font-semibold"
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingId(account.id);
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-ink-400 hover:bg-ink-50 dark:hover:bg-white/5"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-danger/10 disabled:opacity-50"
                  >
                    {deletingId === account.id ? "Excluindo..." : "🗑️ Excluir"}
                  </button>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
