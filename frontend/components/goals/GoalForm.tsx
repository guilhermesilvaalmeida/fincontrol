"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import { goalSchema, type GoalFormValues } from "@/lib/validators/goal";

export function GoalForm({ onSuccess }: { onSuccess: () => void }) {
  const [targetDigits, setTargetDigits] = useState("");
  const [initialDigits, setInitialDigits] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({ resolver: zodResolver(goalSchema) });

  async function onSubmit(values: GoalFormValues) {
    setFormError(null);
    try {
      await api.post("/api/goals", values);
      revalidateAll();
      onSuccess();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível criar a meta.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome da meta" placeholder="Ex: Comprar carro" error={errors.name?.message} {...register("name")} />

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Valor objetivo</label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(targetDigits)}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "");
              setTargetDigits(d);
              setValue("targetAmount", parseBRLInput(d), { shouldValidate: true });
            }}
            className="money w-full bg-transparent text-sm outline-none"
          />
        </div>
        {errors.targetAmount && <span className="text-xs text-danger">{errors.targetAmount.message}</span>}
      </div>

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Já guardado (opcional)</label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(initialDigits)}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "");
              setInitialDigits(d);
              setValue("initialAmount", parseBRLInput(d));
            }}
            className="money w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <Input label="Prazo (opcional)" type="date" {...register("targetDate")} />
      <Input label="Descrição (opcional)" placeholder="Ex: Entrada do carro novo" {...register("description")} />

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Criar meta"}
      </Button>
    </form>
  );
}
