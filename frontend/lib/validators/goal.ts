import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().min(1, "Informe o nome da meta."),
  targetAmount: z.number().positive("Informe o valor da meta."),
  initialAmount: z.number().min(0).optional(),
  targetDate: z.string().optional(),
  description: z.string().optional(),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export const goalContributionSchema = z.object({
  amount: z.number().positive("Informe um valor maior que zero."),
});

export type GoalContributionFormValues = z.infer<typeof goalContributionSchema>;
