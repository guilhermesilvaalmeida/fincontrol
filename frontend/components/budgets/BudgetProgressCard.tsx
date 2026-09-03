import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { Budget } from "@/types/finance";

const statusStyles: Record<Budget["status"], { bar: string; text: string }> = {
  ok: { bar: "bg-emerald", text: "text-emerald-600 dark:text-emerald" },
  attention: { bar: "bg-gold", text: "text-gold" },
  near_limit: { bar: "bg-gold", text: "text-gold" },
  exceeded: { bar: "bg-danger", text: "text-danger" },
};

export function BudgetProgressCard({ budget, onEdit, onDelete }: { budget: Budget; onEdit?: () => void; onDelete?: () => void }) {
  const style = statusStyles[budget.status];
  const widthPercent = Math.min(100, budget.percentUsed);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {budget.categoryIcon ?? "📦"}
          </span>
          <p className="font-medium text-ink dark:text-white">{budget.categoryName}</p>
        </div>
        <div className="flex items-center gap-3">
          {onEdit && (
            <button onClick={onEdit} className="text-xs text-ink-400 hover:text-emerald">
              Editar
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs text-ink-400 hover:text-danger">
              Remover
            </button>
          )}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
        <div className={clsx("h-full rounded-full transition-all", style.bar)} style={{ width: `${widthPercent}%` }} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span>
          <Money value={budget.spent} className="font-medium" /> <span className="text-ink-400">/ {budget.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </span>
        <span className={clsx("font-medium", style.text)}>{budget.percentUsed.toFixed(0)}%</span>
      </div>

      {budget.status === "exceeded" && (
        <p className="text-xs text-danger">Orçamento ultrapassado em {(budget.spent - budget.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
      )}
    </Card>
  );
}
