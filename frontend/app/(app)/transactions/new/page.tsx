"use client";

import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default function NewTransactionPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">+ Adicionar gasto</h1>
        <p className="text-sm text-ink-400">Registre em poucos segundos.</p>
      </div>

      <div className="card p-6">
        <TransactionForm onSuccess={() => router.push("/transactions")} />
      </div>
    </div>
  );
}
