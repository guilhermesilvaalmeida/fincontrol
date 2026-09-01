"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { InstallmentPurchaseForm } from "@/components/creditcards/InstallmentPurchaseForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { CreditCard } from "@/types/finance";

export default function NewInstallmentPurchasePage() {
  const router = useRouter();
  const { data: cards } = useSWR<CreditCard[]>("/api/credit-cards", api.get);

  if (cards && cards.length === 0) {
    return (
      <Card className="mx-auto flex max-w-md flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-ink-400">Você precisa cadastrar um cartão antes de registrar uma compra parcelada.</p>
        <Link href="/credit-cards">
          <Button>+ Novo cartão</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <Link href="/credit-cards" className="text-sm text-ink-400 hover:underline">
          ‹ Cartões
        </Link>
        <h1 className="mt-1 font-display text-xl font-bold text-ink dark:text-white">Compra parcelada</h1>
        <p className="text-sm text-ink-400">O sistema gera cada parcela automaticamente.</p>
      </div>

      <Card>
        <InstallmentPurchaseForm onSuccess={() => router.push("/credit-cards")} />
      </Card>
    </div>
  );
}
