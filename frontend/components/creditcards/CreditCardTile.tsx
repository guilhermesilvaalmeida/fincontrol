import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Money } from "@/components/ui/Money";
import type { CreditCard } from "@/types/finance";

export function CreditCardTile({ card }: { card: CreditCard }) {
  const usedPercent = card.creditLimit > 0 ? Math.min(100, (card.committedAmount / card.creditLimit) * 100) : 0;

  return (
    <Link href={`/credit-cards/${card.id}`}>
      <Card className="flex flex-col gap-3 transition-shadow hover:shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-ink dark:text-white">{card.name}</p>
            {card.bank && <p className="text-xs text-ink-400">{card.bank}</p>}
          </div>
          <span className="text-2xl" aria-hidden>
            💳
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-emerald transition-all"
            style={{ width: `${usedPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-ink-400">Disponível</p>
            <Money value={card.availableLimit} className="font-medium" />
          </div>
          <div>
            <p className="text-xs text-ink-400">Limite</p>
            <Money value={card.creditLimit} tone="muted" className="font-medium" />
          </div>
        </div>

        <div className="flex justify-between text-xs text-ink-400">
          <span>Fechamento dia {card.closingDay}</span>
          <span>Vencimento dia {card.dueDay}</span>
        </div>
      </Card>
    </Link>
  );
}
