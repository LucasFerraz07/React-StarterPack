import { z } from "zod";

export const leagueSchema = z.object({
	name: z.string().min(1, "Informe um nome para a liga"),
	subscription_id: z.string().min(1, "Escolha uma assinatura"),
	subscription_duration: z.int().min(1, "Informe a duração da assinatura"),
	owner: z.object({
		username: z.string().min(1, "Informe o username do responsável"),
		email: z.email("Informe o email do responsável"),
		password: z.string().min(8, "Informe a senha do responsável"),
		phone: z.string().min(1, "Informe o telefone do responsável").max(15),
		full_name: z.string().min(1, "Informe o nome completo do responsável"),
		cpf: z
			.string()
			.min(1, "Informe o CPF do responsável")
			.max(14, "O campo de CPF deve ter no máximo 14 caracteres!"),
	}),
});

export type LeagueSchema = z.infer<typeof leagueSchema>;

const limitSchema = z
	.int()
	.min(0)
	.max(255, "O limite deve ser no máximo 255")
	.nullable();

export const leagueUpdateSchema = z.object({
	name: z.string().min(1, "Informe um nome para a liga"),
	player_limit: limitSchema,
	silver_limit: limitSchema,
	golden_limit: limitSchema,
	black_limit: limitSchema,
	mulct_contract_limit: limitSchema,
});

export type LeagueUpdateSchema = z.infer<typeof leagueUpdateSchema>;
