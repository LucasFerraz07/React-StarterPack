import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { getIndexClubQueryKey, useUpdateClub } from "@/api/generated/club/club";
import type { ClubResource } from "@/api/generated/models/clubResource";
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
import { getMediaUrl } from "@/lib/media";
import {
	type ClubSchema,
	clubRegionLabels,
	clubSchema,
} from "@/schemas/club-schema";

interface ClubEditDialogProps {
	club: ClubResource;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ClubEditDialog({
	club,
	open,
	onOpenChange,
}: ClubEditDialogProps) {
	const queryClient = useQueryClient();

	const { control, handleSubmit, reset } = useForm<ClubSchema>({
		resolver: zodResolver(clubSchema),
		defaultValues: {
			name: club.name,
			region: club.region as ClubSchema["region"],
			crest: null,
		},
	});

	React.useEffect(() => {
		if (open) {
			reset({
				name: club.name,
				region: club.region as ClubSchema["region"],
				crest: null,
			});
		}
	}, [open, club, reset]);

	const { mutate, isPending } = useUpdateClub({
		mutation: {
			onSuccess: () => {
				toast.success("Clube atualizado com sucesso!");
				queryClient.invalidateQueries({ queryKey: getIndexClubQueryKey() });
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível atualizar o clube.");
			},
		},
	});

	const onSubmit = (data: ClubSchema) => {
		mutate({ id: club.id, data });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editar Clube</DialogTitle>
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
										existingImageUrl={getMediaUrl(club.crest)}
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
							{isPending ? "Salvando..." : "Salvar"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
