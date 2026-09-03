"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { BudgetProgressCard } from "@/components/budgets/BudgetProgressCard";
import { api } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import type { Budget } from "@/types/finance";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useSWR<Budget[]>("/api/budgets", api.get);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Remover este orçamento?")) return;
    await api.delete(`/api/budgets/${id}`);
    revalidateAll();
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink dark:text-white">Orçamentos</h1>
          <p className="text-sm text-ink-400">Limites mensais por categoria, atualizados em tempo real.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "+ Novo orçamento"}</Button>
      </div>

      {(showForm || editingBudget) && (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-ink dark:text-white">
              {editingBudget ? "Editar orçamento" : "Novo orçamento"}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingBudget(null); }}>
              Cancelar
            </Button>
          </div>
          <BudgetForm
            budget={editingBudget ?? undefined}
            onSuccess={() => { setShowForm(false); setEditingBudget(null); }}
          />
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-ink-400">Você ainda não definiu nenhum orçamento.</p>
          <Button onClick={() => setShowForm(true)}>+ Novo orçamento</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetProgressCard
              key={budget.id}
              budget={budget}
              onEdit={() => handleEdit(budget)}
              onDelete={() => handleDelete(budget.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
