"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import type { TransactionType } from "@/types/finance";

function NewTransactionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const defaultType: TransactionType = typeParam === "INCOME" ? "INCOME" : "EXPENSE";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-bold text-ink dark:text-white">
          {defaultType === "INCOME" ? "+ Adicionar receita" : "+ Adicionar gasto"}
        </h1>
        <p className="text-sm text-ink-400">Registre em poucos segundos.</p>
      </div>

      <div className="card p-6">
        <TransactionForm defaultType={defaultType} onSuccess={() => router.push("/transactions")} />
      </div>
    </div>
  );
}

export default function NewTransactionPage() {
  return (
    <Suspense fallback={null}>
      <NewTransactionContent />
    </Suspense>
  );
}
