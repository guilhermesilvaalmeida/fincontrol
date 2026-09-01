import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { ReportsResponse } from "@/types/finance";

export function CategoryComparisonList({ data }: { data: ReportsResponse["categoryComparison"] }) {
  const withMovement = data.filter((c) => c.currentAmount > 0 || c.previousAmount > 0);

  if (withMovement.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-base font-semibold text-ink dark:text-white">Este mês x mês anterior</h2>
        <p className="mt-6 text-center text-sm text-ink-400">Sem dados suficientes para comparar ainda.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Este mês x mês anterior</h2>
      <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
        {withMovement.slice(0, 8).map((c) => {
          const isUp = c.percentChange > 0;
          const isFlat = c.percentChange === 0;
          return (
            <li key={c.categoryId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg" aria-hidden>
                  {c.icon ?? "📦"}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white">{c.name}</p>
                  <Money value={c.currentAmount} tone="muted" className="text-xs" />
                </div>
              </div>
              <span
                className={`text-sm font-medium ${isFlat ? "text-ink-400" : isUp ? "text-danger" : "text-emerald"}`}
              >
                {isFlat ? "—" : `${isUp ? "+" : ""}${c.percentChange.toFixed(0)}%`}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
