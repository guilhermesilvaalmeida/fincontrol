import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive("O valor deve ser maior que zero."),
  description: z.string().min(1, "Informe uma descrição."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  accountId: z.string().min(1, "Selecione uma conta."),
  paymentMethod: z.string().optional(),
  occurredOn: z.string().min(1, "Informe a data."),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
