"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import { budgetSchema, type BudgetFormValues } from "@/lib/validators/budget";
import type { Budget, Category } from "@/types/finance";

export function BudgetForm({ budget, onSuccess }: { budget?: Budget; onSuccess: () => void }) {
  const { data: categories } = useSWR<Category[]>("/api/categories", api.get);
  const expenseCategories = (categories ?? []).filter((c) => c.groupName !== "Receitas");

  const [amountDigits, setAmountDigits] = useState(budget ? Math.round(budget.amount * 100).toString() : "");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget ? { categoryId: budget.categoryId, amount: budget.amount } : undefined,
  });

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountDigits(digits);
    setValue("amount", parseBRLInput(digits), { shouldValidate: true });
  }

  async function onSubmit(values: BudgetFormValues) {
    setFormError(null);
    try {
      if (budget) {
        await api.put(`/api/budgets/${budget.id}`, values);
      } else {
        await api.post("/api/budgets", values);
      }
      revalidateAll();
      onSuccess();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar o orçamento.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Select label="Categoria" error={errors.categoryId?.message} disabled={Boolean(budget)} {...field}>
            <option value="">Selecione...</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        )}
      />

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Limite mensal</label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(amountDigits)}
            onChange={handleAmountChange}
            className="money w-full bg-transparent text-sm outline-none"
          />
        </div>
        {errors.amount && <span className="text-xs text-danger">{errors.amount.message}</span>}
      </div>

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : budget ? "Salvar alterações" : "Criar orçamento"}
      </Button>
    </form>
  );
}
