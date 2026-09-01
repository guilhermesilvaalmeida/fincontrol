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
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-ink dark:text-white">{transaction.description}</p>
            {transaction.installmentNumber && transaction.installmentTotal && (
              <span className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:bg-white/5">
                {transaction.installmentNumber}/{transaction.installmentTotal}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-400">
            {transaction.category?.name ?? "Sem categoria"} ·{" "}
            {transaction.creditCard ? `💳 ${transaction.creditCard.name}` : transaction.account?.name ?? "—"} ·{" "}
            {new Date(transaction.occurredOn + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
      <Money value={transaction.amount} tone={transaction.type === "INCOME" ? "positive" : "default"} />
    </li>
  );
}
