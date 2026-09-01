"use client";

import useSWR from "swr";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { api } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import type { Goal } from "@/types/finance";

export default function GoalsPage() {
  const { data: goals, isLoading } = useSWR<Goal[]>("/api/goals", api.get);
  const [showForm, setShowForm] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Remover esta meta?")) return;
    await api.delete(`/api/goals/${id}`);
    revalidateAll();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink dark:text-white">Metas financeiras</h1>
          <p className="text-sm text-ink-400">Acompanhe o quanto falta para cada objetivo.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancelar" : "+ Nova meta"}</Button>
      </div>

      {showForm && (
        <Card>
          <GoalForm onSuccess={() => setShowForm(false)} />
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !goals || goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-ink-400">Você ainda não criou nenhuma meta.</p>
          <Button onClick={() => setShowForm(true)}>+ Nova meta</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={() => handleDelete(goal.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
