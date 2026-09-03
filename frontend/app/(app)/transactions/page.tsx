"use client";

import Link from "next/link";
import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import type { Account, Category, Transaction, TransactionType } from "@/types/finance";

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TransactionType | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [sort, setSort] = useState("recent");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: categories } = useSWR<Category[]>("/api/categories", api.get);
  const { data: accounts } = useSWR<Account[]>("/api/accounts", api.get);

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  if (categoryId) params.set("categoryId", categoryId);
  if (accountId) params.set("accountId", accountId);
  if (sort) params.set("sort", sort);

  const { data: transactions, isLoading, mutate } = useSWR<Transaction[]>(
    `/api/transactions?${params.toString()}`,
    api.get
  );

  async function deleteTransaction(transaction: Transaction) {
    const isInstallmentPurchase = Boolean(transaction.installmentPurchaseId);
    const confirmation = isInstallmentPurchase
      ? `Excluir a compra parcelada "${transaction.description.replace(/ \(\d+\/\d+\)$/, "")}" inteira? Todas as parcelas serão removidas. Esta ação não pode ser desfeita.`
      : `Excluir a transação "${transaction.description}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(confirmation)) return;

    setActionError(null);
    try {
      if (isInstallmentPurchase) {
        await api.delete(`/api/installment-purchases/${transaction.installmentPurchaseId}`);
      } else {
        await api.delete(`/api/transactions/${transaction.id}`);
      }
      await mutate(
        (items) => items?.filter((item) => isInstallmentPurchase
          ? item.installmentPurchaseId !== transaction.installmentPurchaseId
          : item.id !== transaction.id),
        { revalidate: false }
      );
      revalidateAll();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Não foi possível excluir a transação.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">Transações</h1>
        <Link href="/transactions/new" className="hidden md:block">
          <Button>+ Adicionar gasto</Button>
        </Link>
      </div>

      {editingTransaction && (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-ink dark:text-white">Editar transação</h2>
            <Button variant="ghost" size="sm" onClick={() => setEditingTransaction(null)}>Cancelar</Button>
          </div>
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={() => {
              setEditingTransaction(null);
              mutate();
            }}
          />
        </Card>
      )}

      <Card className="flex flex-col gap-4">
        <input
          type="search"
          placeholder="Pesquisar por descrição..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald dark:border-white/10 dark:bg-surface-cardDark"
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select label="Tipo" value={type} onChange={(e) => setType(e.target.value as TransactionType | "")}>
            <option value="">Todos</option>
            <option value="EXPENSE">Despesa</option>
            <option value="INCOME">Receita</option>
          </Select>

          <Select label="Categoria" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Todas</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select label="Conta" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">Todas</option>
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>

          <Select label="Ordenar por" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Mais recente</option>
            <option value="oldest">Mais antigo</option>
            <option value="highest">Maior valor</option>
            <option value="lowest">Menor valor</option>
          </Select>
        </div>
      </Card>

      <Card>
        {actionError && <p className="mb-3 text-sm text-danger">{actionError}</p>}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-ink-400">Nenhuma transação encontrada com esses filtros.</p>
            <Link href="/transactions/new">
              <Button>+ Adicionar gasto</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-white/10">
            {transactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} onEdit={setEditingTransaction} onDelete={deleteTransaction} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
