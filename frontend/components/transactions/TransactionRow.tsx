import { Money } from "@/components/ui/Money";
import type { Transaction } from "@/types/finance";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden>
          {transaction.category?.icon ?? "📦"}
        </span>
        <div>
          <p className="text-sm font-medium text-ink dark:text-white">{transaction.description}</p>
          <p className="text-xs text-ink-400">
            {transaction.category?.name ?? "Sem categoria"} · {transaction.account?.name ?? "—"} ·{" "}
            {new Date(transaction.occurredOn + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
      <Money value={transaction.amount} tone={transaction.type === "INCOME" ? "positive" : "default"} />
    </li>
  );
}
