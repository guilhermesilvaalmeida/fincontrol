import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { DashboardResponse } from "@/types/finance";

export function RecentTransactions({ items }: { items: DashboardResponse["recentTransactions"] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink dark:text-white">Últimos gastos</h2>
        <Link href="/transactions" className="text-sm font-medium text-emerald hover:underline">
          Ver tudo
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-ink-400">Você ainda não possui gastos registrados.</p>
          <Link
            href="/transactions/new"
            className="rounded-xl bg-emerald px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            + Adicionar gasto
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-ink-100 dark:divide-white/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-xl" aria-hidden>
                  {item.categoryIcon ?? "📦"}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink dark:text-white">{item.description}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(item.occurredOn + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <Money value={item.amount} tone={item.type === "INCOME" ? "positive" : "default"} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
