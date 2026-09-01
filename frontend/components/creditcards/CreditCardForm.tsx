"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import { creditCardSchema, type CreditCardFormValues } from "@/lib/validators/creditCard";

export function CreditCardForm({ onSuccess }: { onSuccess: () => void }) {
  const [limitDigits, setLimitDigits] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreditCardFormValues>({ resolver: zodResolver(creditCardSchema) });

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setLimitDigits(digits);
    setValue("creditLimit", parseBRLInput(digits), { shouldValidate: true });
  }

  async function onSubmit(values: CreditCardFormValues) {
    setFormError(null);
    try {
      await api.post("/api/credit-cards", values);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar o cartão.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome do cartão" placeholder="Ex: Nubank" error={errors.name?.message} {...register("name")} />
      <Input label="Banco (opcional)" placeholder="Ex: Nu Pagamentos" {...register("bank")} />

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Limite</label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(limitDigits)}
            onChange={handleLimitChange}
            className="money w-full bg-transparent text-sm outline-none"
          />
        </div>
        {errors.creditLimit && <span className="text-xs text-danger">{errors.creditLimit.message}</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Dia de fechamento"
          type="number"
          min={1}
          max={28}
          error={errors.closingDay?.message}
          {...register("closingDay", { valueAsNumber: true })}
        />
        <Input
          label="Dia de vencimento"
          type="number"
          min={1}
          max={28}
          error={errors.dueDay?.message}
          {...register("dueDay", { valueAsNumber: true })}
        />
      </div>

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar cartão"}
      </Button>
    </form>
  );
}
