import { z } from "zod";

export const leagueCategoryPriceSchema = z.object({
	min_overall: z.int().min(0).max(99, "Informe um overall entre 0 e 99"),
	base_salary: z.number().min(0, "Informe um salário base válido"),
});

export type LeagueCategoryPriceSchema = z.infer<
	typeof leagueCategoryPriceSchema
>;
