import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { type Control, Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getShowLeagueQueryKey,
	useUpdateLeague,
} from "@/api/generated/league/league";
import type { LeagueResource } from "@/api/generated/models/leagueResource";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type LeagueUpdateSchema,
	leagueUpdateSchema,
} from "@/schemas/league-schema";

interface LeagueEditDialogProps {
	league: LeagueResource;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function buildDefaultValues(league: LeagueResource): LeagueUpdateSchema {
	return {
		name: league.name,
		player_limit: league.player_limit,
		silver_limit: league.silver_limit,
		golden_limit: league.golden_limit,
		black_limit: league.black_limit,
		mulct_contract_limit: league.mulct_contract_limit,
	};
}

function LimitField({
	name,
	label,
	control,
}: {
	name: keyof Omit<LeagueUpdateSchema, "name">;
	label: string;
	control: Control<LeagueUpdateSchema>;
}) {
	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<Field data-invalid={fieldState.invalid}>
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
					<Input
						id={field.name}
						name={field.name}
						type="number"
						min="0"
						max="255"
						placeholder="Sem limite"
						value={field.value ?? ""}
						onChange={(event) =>
							field.onChange(
								event.target.value === "" ? null : event.target.valueAsNumber,
							)
						}
						onBlur={field.onBlur}
						aria-invalid={fieldState.invalid}
					/>
					<FieldError errors={[fieldState.error]} />
				</Field>
			)}
		/>
	);
}

export function LeagueEditDialog({
	league,
	open,
	onOpenChange,
}: LeagueEditDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<LeagueUpdateSchema>({
		resolver: zodResolver(leagueUpdateSchema),
		defaultValues: buildDefaultValues(league),
	});

	React.useEffect(() => {
		if (open) {
			reset(buildDefaultValues(league));
		}
	}, [open, league, reset]);

	const { mutate, isPending } = useUpdateLeague({
		mutation: {
			onSuccess: () => {
				toast.success("Liga atualizada com sucesso!");
				queryClient.invalidateQueries({
					queryKey: getShowLeagueQueryKey(league.id),
				});
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível atualizar a liga.");
			},
		},
	});

	const onSubmit = (data: LeagueUpdateSchema) => {
		mutate({ id: league.id, data });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar Liga</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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

						<LimitField
							name="player_limit"
							label="Limite de Jogadores"
							control={control}
						/>
						<LimitField
							name="silver_limit"
							label="Limite Categoria Prata"
							control={control}
						/>
						<LimitField
							name="golden_limit"
							label="Limite Categoria Ouro"
							control={control}
						/>
						<LimitField
							name="black_limit"
							label="Limite Categoria Black"
							control={control}
						/>
						<LimitField
							name="mulct_contract_limit"
							label="Limite de Contratos de Multa"
							control={control}
						/>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Salvando..." : "Salvar"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
