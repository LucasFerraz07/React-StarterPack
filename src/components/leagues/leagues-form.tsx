import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useStoreLeague } from "@/api/generated/league/league";
import { useIndexSubscription } from "@/api/generated/subscription/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type LeagueSchema, leagueSchema } from "@/schemas/league-schema";
import { routes } from "@/utils/routes";

const subDurationItems = [
	{ label: "1 mês", value: 1 },
	{ label: "2 meses", value: 2 },
	{ label: "3 meses", value: 3 },
	{ label: "4 meses", value: 4 },
	{ label: "5 meses", value: 5 },
	{ label: "6 meses", value: 6 },
	{ label: "7 meses", value: 7 },
	{ label: "8 meses", value: 8 },
	{ label: "9 meses", value: 9 },
	{ label: "10 meses", value: 10 },
	{ label: "11 meses", value: 11 },
	{ label: "12 meses", value: 12 },
];

export function LeagueForm() {
	const navigate = useNavigate();
	const { data: subscriptionsData } = useIndexSubscription();
	const subscriptions = subscriptionsData?.data.data ?? [];

	const { control, handleSubmit } = useForm<LeagueSchema>({
		resolver: zodResolver(leagueSchema),
		defaultValues: {
			name: "",
			subscription_id: "",
			subscription_duration: 1,
			owner: {
				username: "",
				email: "",
				password: "",
				phone: "",
				full_name: "",
				cpf: "",
			},
		},
	});

	const { mutate, isPending } = useStoreLeague({
		mutation: {
			onSuccess: () => {
				toast.success("Liga criada com sucesso!");
			},
			onError: () => {
				toast.error("Não foi possível criar a liga.");
			},
		},
	});

	const onSubmit = (data: LeagueSchema) => {
		mutate({ data });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Informações da Liga</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Nome da Liga
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="subscription_id"
							control={control}
							render={({ field, fieldState }) => {
								const selected =
									subscriptions.find((s) => s.id === field.value) ?? null;

								return (
									<Field
										data-invalid={fieldState.invalid}
										className="w-full max-w-xs"
									>
										<FieldLabel required>Assinatura</FieldLabel>
										<Combobox
											items={subscriptions}
											value={selected}
											onValueChange={(subscription) =>
												field.onChange(subscription?.id ?? "")
											}
											itemToStringLabel={(subscription) => subscription.name}
											isItemEqualToValue={(item, value) => item.id === value.id}
										>
											<ComboboxInput
												placeholder="Escolha uma assinatura"
												aria-invalid={fieldState.invalid}
												required
											/>
											<ComboboxContent>
												<ComboboxEmpty>
													Nenhuma assinatura encontrada.
												</ComboboxEmpty>
												<ComboboxList>
													{(subscription) => (
														<ComboboxItem
															key={subscription.id}
															value={subscription}
														>
															{subscription.name}
														</ComboboxItem>
													)}
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
										<FieldError errors={[fieldState.error]} />
									</Field>
								);
							}}
						/>

						<Controller
							name="subscription_duration"
							control={control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="w-full max-w-xs"
								>
									<FieldLabel required>Duração da Assinatura</FieldLabel>
									<Select
										value={String(field.value)}
										onValueChange={(value) => field.onChange(Number(value))}
									>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{subDurationItems.map((item) => (
													<SelectItem
														key={item.value}
														value={String(item.value)}
													>
														{item.label}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Informações do Responsável</CardTitle>
				</CardHeader>
				<CardContent>
					<FieldGroup>
						<Controller
							name="owner.username"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Username do Responsável
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="owner.email"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Email do Responsável
									</FieldLabel>
									<Input
										type="email"
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="owner.password"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Senha do Responsável
									</FieldLabel>
									<Input
										type="password"
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="owner.phone"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Telefone do Responsável
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="owner.full_name"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Nome Completo do Responsável
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="owner.cpf"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										CPF do Responsável
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</FieldGroup>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-3">
				<Button
					type="button"
					variant="outline"
					onClick={() => navigate({ to: routes.leagues.leagues })}
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={isPending}>
					{isPending ? "Criando..." : "Criar Liga"}
				</Button>
			</div>
		</form>
	);
}
