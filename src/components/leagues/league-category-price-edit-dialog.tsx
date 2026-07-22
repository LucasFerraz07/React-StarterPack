import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getIndexLeagueCategoryPriceQueryKey,
	useUpdateLeagueCategoryPrice,
} from "@/api/generated/league-category-price/league-category-price";
import type { LeagueCategoryPriceResource } from "@/api/generated/models/leagueCategoryPriceResource";
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
	type LeagueCategoryPriceSchema,
	leagueCategoryPriceSchema,
} from "@/schemas/league-category-price-schema";

interface LeagueCategoryPriceEditDialogProps {
	categoryPrice: LeagueCategoryPriceResource;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LeagueCategoryPriceEditDialog({
	categoryPrice,
	open,
	onOpenChange,
}: LeagueCategoryPriceEditDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<LeagueCategoryPriceSchema>({
		resolver: zodResolver(leagueCategoryPriceSchema),
		defaultValues: {
			min_overall: categoryPrice.min_overall,
			base_salary: Number(categoryPrice.base_salary),
		},
	});

	React.useEffect(() => {
		if (open) {
			reset({
				min_overall: categoryPrice.min_overall,
				base_salary: Number(categoryPrice.base_salary),
			});
		}
	}, [open, categoryPrice, reset]);

	const { mutate, isPending } = useUpdateLeagueCategoryPrice({
		mutation: {
			onSuccess: () => {
				toast.success("Preço da categoria atualizado com sucesso!");
				queryClient.invalidateQueries({
					queryKey: getIndexLeagueCategoryPriceQueryKey({
						league_id: categoryPrice.league_id,
					}),
				});
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível atualizar o preço da categoria.");
			},
		},
	});

	const onSubmit = (data: LeagueCategoryPriceSchema) => {
		mutate({ id: categoryPrice.id, data });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar Preço da Categoria</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<FieldGroup>
						<Controller
							name="min_overall"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Overall Mínimo
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										min="0"
										max="99"
										value={field.value}
										onChange={(event) =>
											field.onChange(event.target.valueAsNumber || 0)
										}
										onBlur={field.onBlur}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="base_salary"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Salário Base
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										step="0.01"
										min="0"
										value={field.value}
										onChange={(event) =>
											field.onChange(event.target.valueAsNumber || 0)
										}
										onBlur={field.onBlur}
										aria-invalid={fieldState.invalid}
										required
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
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
