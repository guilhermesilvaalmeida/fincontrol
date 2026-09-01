import { z } from "zod";

export const creditCardSchema = z.object({
  name: z.string().min(1, "Informe o nome do cartão."),
  bank: z.string().optional(),
  creditLimit: z.number().positive("Informe o limite do cartão."),
  closingDay: z.number().min(1).max(28, "O dia deve ser entre 1 e 28."),
  dueDay: z.number().min(1).max(28, "O dia deve ser entre 1 e 28."),
});

export type CreditCardFormValues = z.infer<typeof creditCardSchema>;
