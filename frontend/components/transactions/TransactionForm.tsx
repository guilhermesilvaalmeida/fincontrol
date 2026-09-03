"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api, ApiError } from "@/lib/api";
import { revalidateAll } from "@/lib/revalidate";
import { formatBRLInputFromDigits, parseBRLInput } from "@/lib/currency";
import { transactionSchema, type TransactionFormValues } from "@/lib/validators/transaction";
import type { Account, Category, Transaction, TransactionType } from "@/types/finance";

const paymentMethods = ["Dinheiro", "Débito", "Crédito", "Pix", "Transferência"];

export function TransactionForm({
  onSuccess,
  defaultType = "EXPENSE",
  transaction,
}: {
  onSuccess?: () => void;
  defaultType?: TransactionType;
  transaction?: Transaction;
}) {
  const { data: categories } = useSWR<Category[]>("/api/categories", api.get);
  const { data: accounts } = useSWR<Account[]>("/api/accounts", api.get);

  const [amountDigits, setAmountDigits] = useState(() =>
    transaction ? String(Math.round(transaction.amount * 100)) : ""
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type ?? defaultType,
      occurredOn: transaction?.occurredOn ?? new Date().toISOString().slice(0, 10),
      amount: transaction?.amount ?? 0,
      description: transaction?.description ?? "",
      categoryId: transaction?.category?.id ?? "",
      accountId: transaction?.account?.id ?? "",
      paymentMethod: transaction?.paymentMethod ?? "",
      notes: transaction?.notes ?? "",
    },
  });

  const type = watch("type");
  const expenseCategories = (categories ?? []).filter((c) => c.groupName !== "Receitas");
  const incomeCategories = (categories ?? []).filter((c) => c.groupName === "Receitas");
  const visibleCategories = type === "INCOME" ? incomeCategories : expenseCategories;

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountDigits(digits);
    setValue("amount", parseBRLInput(digits), { shouldValidate: true });
  }

  async function onSubmit(values: TransactionFormValues) {
    setFormError(null);
    try {
      if (transaction) {
        await api.put(`/api/transactions/${transaction.id}`, values);
      } else {
        await api.post("/api/transactions", values);
      }
      revalidateAll();
      setSuccess(true);
      setAmountDigits("");
      reset({
        type: values.type,
        occurredOn: values.occurredOn,
        amount: 0,
        description: "",
        categoryId: "",
        accountId: values.accountId,
        paymentMethod: values.paymentMethod,
        notes: "",
      });
      onSuccess?.();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Não foi possível salvar a transação. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2">
        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue("type", t)}
            className={clsx(
              "rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              type === t
                ? t === "EXPENSE"
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-emerald bg-emerald-50 text-emerald-600"
                : "border-ink-100 text-ink-400 dark:border-white/10"
            )}
          >
            {t === "EXPENSE" ? "Despesa" : "Receita"}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-ink-700 dark:text-white/80">
          {type === "EXPENSE" ? "Quanto você gastou?" : "Quanto você recebeu?"}
        </label>
        <div className="mt-1.5 flex items-center rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 focus-within:border-emerald dark:border-white/10 dark:bg-surface-cardDark">
          <span className="mr-1 text-sm text-ink-400">R$</span>
          <input
            inputMode="numeric"
            placeholder="0,00"
            value={formatBRLInputFromDigits(amountDigits)}
            onChange={handleAmountChange}
            className="money w-full bg-transparent text-lg outline-none"
          />
        </div>
        {errors.amount && <span className="text-xs text-danger">{errors.amount.message}</span>}
      </div>

      <Input
        label={type === "EXPENSE" ? "Onde você gastou?" : "Descrição"}
        placeholder={type === "EXPENSE" ? "Ex: Padaria" : "Ex: Salário"}
        error={errors.description?.message}
        {...register("description")}
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Select label="Categoria" error={errors.categoryId?.message} {...field}>
            <option value="">Selecione...</option>
            {visibleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </Select>
        )}
      />

      <Controller
        control={control}
        name="accountId"
        render={({ field }) => (
          <Select label="Conta" error={errors.accountId?.message} {...field}>
            <option value="">Selecione...</option>
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        )}
      />

      <Controller
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <Select label="Forma de pagamento" {...field} value={field.value ?? ""}>
            <option value="">Selecione...</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        )}
      />

      <Input label="Data" type="date" error={errors.occurredOn?.message} {...register("occurredOn")} />

      {formError && <p className="text-sm text-danger">{formError}</p>}
      {success && <p className="text-sm text-emerald">Transação salva com sucesso.</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Salvando..." : transaction ? "Salvar alterações" : "Salvar"}
      </Button>
    </form>
  );
}
