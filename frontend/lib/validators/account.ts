import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Informe o nome da conta."),
  type: z.enum(["CHECKING", "SAVINGS", "WALLET", "CASH", "INVESTMENT", "OTHER"]),
  institution: z.string().optional(),
  initialBalance: z.number(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
