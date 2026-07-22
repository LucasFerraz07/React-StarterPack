import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	getIndexTransactionTypeQueryKey,
	useStoreTransactionType,
} from "@/api/generated/transaction-type/transaction-type";
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
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type TransactionTypeSchema,
	transactionOperationLabels,
	transactionTypeSchema,
} from "@/schemas/transaction-type-schema";

interface TransactionTypeCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TransactionTypeCreateDialog({
	open,
	onOpenChange,
}: TransactionTypeCreateDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<TransactionTypeSchema>({
		resolver: zodResolver(transactionTypeSchema),
		defaultValues: {
			name: "",
			description: null,
			operation: "" as TransactionTypeSchema["operation"],
		},
	});

	const { mutate, isPending } = useStoreTransactionType({
		mutation: {
			onSuccess: () => {
				toast.success("Tipo de transação criado com sucesso!");
				queryClient.invalidateQueries({
					queryKey: getIndexTransactionTypeQueryKey(),
				});
				reset();
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível criar o tipo de transação.");
			},
		},
	});

	const onSubmit = (data: TransactionTypeSchema) => {
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
					<DialogTitle>Cadastrar Tipo de Transação</DialogTitle>
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
							name="operation"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel required>Operação</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Escolha uma operação" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{Object.entries(transactionOperationLabels).map(
													([value, label]) => (
														<SelectItem key={value} value={value}>
															{label}
														</SelectItem>
													),
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
									<Textarea
										id={field.name}
										name={field.name}
										value={field.value ?? ""}
										onChange={(event) =>
											field.onChange(event.target.value || null)
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
							{isPending ? "Criando..." : "Criar Tipo de Transação"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
