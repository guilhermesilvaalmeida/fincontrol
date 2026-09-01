import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { ReportsResponse } from "@/types/finance";

export function TopExpensesList({ data }: { data: ReportsResponse["topExpenses"] }) {
  if (data.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-base font-semibold text-ink dark:text-white">Maiores despesas do mês</h2>
        <p className="mt-6 text-center text-sm text-ink-400">Nenhuma despesa registrada este mês ainda.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-base font-semibold text-ink dark:text-white">Maiores despesas do mês</h2>
      <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
        {data.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden>
                {expense.categoryIcon ?? "📦"}
              </span>
              <div>
                <p className="text-sm font-medium text-ink dark:text-white">{expense.description}</p>
                <p className="text-xs text-ink-400">
                  {expense.categoryName} · {new Date(expense.occurredOn + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <Money value={expense.amount} className="font-medium" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
