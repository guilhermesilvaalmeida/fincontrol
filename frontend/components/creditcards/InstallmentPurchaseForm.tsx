"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import { formatBRL, formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import {
  installmentPurchaseSchema,
  type InstallmentPurchaseFormValues,
} from "@/lib/validators/installmentPurchase";
import type { Category, CreditCard } from "@/types/finance";

export function InstallmentPurchaseForm({
  defaultCreditCardId,
  onSuccess,
}: {
  defaultCreditCardId?: string;
  onSuccess: () => void;
}) {
  const { data: cards } = useSWR<CreditCard[]>("/api/credit-cards", (url: string) => api.get(url));
  const { data: categories } = useSWR<Category[]>("/api/categories", (url: string) => api.get(url));
  const expenseCategories = (categories ?? []).filter((c) => c.groupName !== "Receitas");

  const [amountDigits, setAmountDigits] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InstallmentPurchaseFormValues>({
    resolver: zodResolver(installmentPurchaseSchema),
    defaultValues: {
      creditCardId: defaultCreditCardId ?? "",
      installmentsCount: 2,
      purchaseDate: new Date().toISOString().slice(0, 10),
    },
  });

  const totalAmount = watch("totalAmount") || 0;
  const installmentsCount = watch("installmentsCount") || 1;
  const installmentPreview = totalAmount > 0 && installmentsCount > 0 ? totalAmount / installmentsCount : 0;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountDigits(digits);
    setValue("totalAmount", parseBRLInput(digits), { shouldValidate: true });
  }

  async function onSubmit(values: InstallmentPurchaseFormValues) {
    setFormError(null);
    try {
      await api.post("/api/installment-purchases", values);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível registrar a compra parcelada.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Produto / descrição" placeholder="Ex: TV" error={errors.description?.message} {...register("description")} />

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Valor total</label>
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
        {errors.totalAmount && <span className="text-xs text-danger">{errors.totalAmount.message}</span>}
      </div>

      <Input
        label="Número de parcelas"
        type="number"
        min={1}
        max={60}
        error={errors.installmentsCount?.message}
        {...register("installmentsCount", { valueAsNumber: true })}
      />

      {installmentPreview > 0 && (
        <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600 dark:bg-emerald/10 dark:text-emerald">
          {installmentsCount}x de <strong>{formatBRL(installmentPreview)}</strong>
        </p>
      )}

      <Controller
        control={control}
        name="creditCardId"
        render={({ field }) => (
          <Select label="Cartão" error={errors.creditCardId?.message} {...field}>
            <option value="">Selecione...</option>
            {(cards ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Select label="Categoria" error={errors.categoryId?.message} {...field}>
            <option value="">Selecione...</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        )}
      />

      <Input label="Data da compra" type="date" error={errors.purchaseDate?.message} {...register("purchaseDate")} />

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Registrar compra parcelada"}
      </Button>
    </form>
  );
}
