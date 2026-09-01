import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { DashboardResponse } from "@/types/finance";

export function SummaryCards({ data }: { data: DashboardResponse }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card className="overflow-hidden p-4 md:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Receitas</p>
        <Money value={data.totalIncome} tone="positive" className="mt-2 block truncate text-base font-semibold sm:text-xl" />
      </Card>
      <Card className="overflow-hidden p-4 md:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Despesas</p>
        <Money value={data.totalExpense} tone="negative" className="mt-2 block truncate text-base font-semibold sm:text-xl" />
      </Card>
      <Card className="overflow-hidden p-4 md:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Saldo</p>
        <Money
          value={data.balance}
          tone={data.balance >= 0 ? "default" : "negative"}
          className="mt-2 block truncate text-base font-semibold sm:text-xl"
        />
      </Card>
      <Card className="overflow-hidden p-4 md:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Economia</p>
        <span className="mt-2 block truncate font-mono text-base font-semibold tabular-nums sm:text-xl">
          {data.savingsRate.toFixed(1)}%
        </span>
      </Card>
    </div>
  );
}
