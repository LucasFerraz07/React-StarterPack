import { z } from "zod";
import { TransactionOperation } from "@/api/generated/models/transactionOperation";

export const transactionOperationLabels: Record<TransactionOperation, string> =
	{
		[TransactionOperation.credit]: "Crédito",
		[TransactionOperation.debit]: "Débito",
	};

export const transactionTypeSchema = z.object({
	name: z.string().min(1, "Informe um nome para o tipo de transação").max(50),
	description: z
		.string()
		.max(100, "A descrição deve ter no máximo 100 caracteres")
		.nullable(),
	operation: z.enum(TransactionOperation, "Escolha uma operação"),
});

export type TransactionTypeSchema = z.infer<typeof transactionTypeSchema>;
