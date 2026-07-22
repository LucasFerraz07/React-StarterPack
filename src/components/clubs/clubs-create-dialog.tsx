import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getIndexClubQueryKey, useStoreClub } from "@/api/generated/club/club";
import { AvatarImageUpload } from "@/components/ui/avatar-image-upload";
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
import {
	type ClubSchema,
	clubRegionLabels,
	clubSchema,
} from "@/schemas/club-schema";

interface ClubCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ClubCreateDialog({
	open,
	onOpenChange,
}: ClubCreateDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<ClubSchema>({
		resolver: zodResolver(clubSchema),
		defaultValues: {
			name: "",
			region: "" as ClubSchema["region"],
			crest: null,
		},
	});

	const { mutate, isPending } = useStoreClub({
		mutation: {
			onSuccess: () => {
				toast.success("Clube criado com sucesso!");
				queryClient.invalidateQueries({ queryKey: getIndexClubQueryKey() });
				reset();
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível criar o clube.");
			},
		},
	});

	const onSubmit = (data: ClubSchema) => {
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
					<DialogTitle>Cadastrar Clube</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
					<FieldGroup>
						<Controller
							name="crest"
							control={control}
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="items-start"
								>
									<FieldLabel>Escudo</FieldLabel>
									<AvatarImageUpload
										onChange={field.onChange}
										alt="Escudo do clube"
										label="escudo"
									/>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

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
							name="region"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel required>Região</FieldLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger aria-invalid={fieldState.invalid}>
											<SelectValue placeholder="Escolha uma região" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{Object.entries(clubRegionLabels).map(
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
							{isPending ? "Criando..." : "Criar Clube"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
