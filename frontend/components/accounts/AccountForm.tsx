"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import { accountSchema, type AccountFormValues } from "@/lib/validators/account";

const typeLabels: Record<AccountFormValues["type"], string> = {
  CHECKING: "Conta corrente",
  SAVINGS: "Poupança",
  WALLET: "Carteira",
  CASH: "Dinheiro",
  INVESTMENT: "Investimento",
  OTHER: "Outros",
};

export function AccountForm({ onSuccess }: { onSuccess: () => void }) {
  const [balanceDigits, setBalanceDigits] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { type: "CHECKING", initialBalance: 0 },
  });

  function handleBalanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setBalanceDigits(digits);
    setValue("initialBalance", parseBRLInput(digits), { shouldValidate: true });
  }

  async function onSubmit(values: AccountFormValues) {
    setFormError(null);
    try {
      await api.post("/api/accounts", values);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar a conta.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nome da conta" placeholder="Ex: Nubank" error={errors.name?.message} {...register("name")} />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Select label="Tipo" error={errors.type?.message} {...field}>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        )}
      />

      <Input label="Instituição (opcional)" placeholder="Ex: Nu Pagamentos" {...register("institution")} />

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">Saldo inicial</label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(balanceDigits)}
            onChange={handleBalanceChange}
            className="money w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {formError && <p className="text-sm text-danger">{formError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar conta"}
      </Button>
    </form>
  );
}
