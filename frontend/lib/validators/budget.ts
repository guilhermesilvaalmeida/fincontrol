import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  amount: z.number().positive("Informe o valor do orçamento."),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
