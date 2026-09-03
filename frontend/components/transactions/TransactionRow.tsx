import { Money } from "@/components/ui/Money";
import { Button } from "@/components/ui/Button";
import type { Transaction } from "@/types/finance";

export function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex items-center gap-3">
        <span className="text-xl" aria-hidden>
          {transaction.category?.icon ?? "📦"}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-ink dark:text-white">{transaction.description}</p>
            {transaction.installmentNumber && transaction.installmentTotal && (
              <span className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:bg-white/5">
                {transaction.installmentNumber}/{transaction.installmentTotal}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-ink-400">
            {transaction.category?.name ?? "Sem categoria"} ·{" "}
            {transaction.creditCard ? `💳 ${transaction.creditCard.name}` : transaction.account?.name ?? "—"} ·{" "}
            {new Date(transaction.occurredOn + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Money value={transaction.amount} tone={transaction.type === "INCOME" ? "positive" : "default"} />
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)} disabled={Boolean(transaction.installmentNumber)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(transaction)}>
            {transaction.installmentPurchaseId ? "Excluir compra" : "Excluir"}
          </Button>
        </div>
      </div>
    </li>
  );
}
