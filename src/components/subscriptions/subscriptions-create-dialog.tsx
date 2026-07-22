import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getIndexSubscriptionQueryKey,
	useStoreSubscription,
} from "@/api/generated/subscription/subscription";
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
	type SubscriptionSchema,
	subscriptionSchema,
} from "@/schemas/subscription-schema";

interface SubscriptionCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SubscriptionCreateDialog({
	open,
	onOpenChange,
}: SubscriptionCreateDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<SubscriptionSchema>({
		resolver: zodResolver(subscriptionSchema),
		defaultValues: {
			name: "",
			price: 0,
			user_limit: null,
		},
	});

	const { mutate, isPending } = useStoreSubscription({
		mutation: {
			onSuccess: () => {
				toast.success("Assinatura criada com sucesso!");
				queryClient.invalidateQueries({
					queryKey: getIndexSubscriptionQueryKey(),
				});
				reset();
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível criar a assinatura.");
			},
		},
	});

	const onSubmit = (data: SubscriptionSchema) => {
		mutate({ data });
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) reset();
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cadastrar Assinatura</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<FieldGroup>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Nome
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
							name="price"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name} required>
										Preço
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

						<Controller
							name="user_limit"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>
										Limite de Usuários
									</FieldLabel>
									<Input
										id={field.name}
										name={field.name}
										type="number"
										min="1"
										max="255"
										placeholder="Sem limite"
										value={field.value ?? ""}
										onChange={(event) =>
											field.onChange(
												event.target.value === ""
													? null
													: event.target.valueAsNumber,
											)
										}
										onBlur={field.onBlur}
										aria-invalid={fieldState.invalid}
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
							{isPending ? "Criando..." : "Criar Assinatura"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
