import { z } from "zod";

export const installmentPurchaseSchema = z.object({
  description: z.string().min(1, "Informe uma descrição."),
  totalAmount: z.number().positive("Informe o valor total."),
  installmentsCount: z.number().min(1).max(60, "Máximo de 60 parcelas."),
  creditCardId: z.string().min(1, "Selecione um cartão."),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  purchaseDate: z.string().min(1, "Informe a data da compra."),
});

export type InstallmentPurchaseFormValues = z.infer<typeof installmentPurchaseSchema>;
