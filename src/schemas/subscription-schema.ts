import { z } from "zod";

export const subscriptionSchema = z.object({
	name: z.string().min(1, "Informe um nome para a assinatura"),
	price: z.number().min(0, "Informe um preço válido"),
	user_limit: z
		.int()
		.min(1, "O limite deve ser maior que zero")
		.max(255, "O limite deve ser no máximo 255")
		.nullable(),
});

export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
