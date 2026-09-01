"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import type { Goal } from "@/types/finance";

export function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: () => void }) {
  const [showContribute, setShowContribute] = useState(false);
  const [digits, setDigits] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContribute() {
    const amount = parseBRLInput(digits);
    if (amount <= 0) return;

    setSaving(true);
    setError(null);
    try {
      await api.post(`/api/goals/${goal.id}/contributions`, { amount });
      revalidateAll();
      setDigits("");
      setShowContribute(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível registrar a contribuição.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-ink dark:text-white">{goal.name}</p>
          {goal.targetDate && (
            <p className="text-xs text-ink-400">
              Meta para {new Date(goal.targetDate + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <button onClick={onDelete} className="text-xs text-ink-400 hover:text-danger">
          Remover
        </button>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-emerald transition-all"
          style={{ width: `${Math.min(100, goal.percentComplete)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          <Money value={goal.currentAmount} className="font-medium" tone="positive" /> <span className="text-ink-400">de {goal.targetAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </span>
        <span className="font-medium text-emerald">{goal.percentComplete.toFixed(0)}%</span>
      </div>

      {goal.completed ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-medium text-emerald-600 dark:bg-emerald/10 dark:text-emerald">
          🎉 Meta concluída!
        </p>
      ) : (
        <>
          {goal.monthlyAmountNeeded !== null && (
            <p className="text-xs text-ink-400">
              Guarde <Money value={goal.monthlyAmountNeeded} className="font-medium text-ink dark:text-white" />/mês para atingir a meta a tempo
            </p>
          )}

          {showContribute ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center rounded-xl border border-ink-100 bg-white px-3 py-2 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
                <span className="mr-1 text-sm text-ink-400">R$</span>
                <input
                  inputMode="numeric"
                  placeholder="0,00"
                  value={formatBRLInputFromDigits(digits)}
                  onChange={(e) => setDigits(e.target.value.replace(/\D/g, ""))}
                  className="money w-full bg-transparent text-sm outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-danger">{error}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleContribute} disabled={saving} className="flex-1">
                  {saving ? "Salvando..." : "Confirmar"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowContribute(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setShowContribute(true)}>
              + Guardar dinheiro
            </Button>
          )}
        </>
      )}
    </Card>
  );
}
