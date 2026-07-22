import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import type { PlayerResource } from "@/api/generated/models/playerResource";
import {
	getIndexPlayerQueryKey,
	useUploadPlayerImage,
} from "@/api/generated/player/player";
import { AvatarImageUpload } from "@/components/ui/avatar-image-upload";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { getMediaUrl } from "@/lib/media";

interface PlayerImageUploadDialogProps {
	player: PlayerResource;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PlayerImageUploadDialog({
	player,
	open,
	onOpenChange,
}: PlayerImageUploadDialogProps) {
	const queryClient = useQueryClient();
	const [image, setImage] = React.useState<File | null>(null);

	const { mutate, isPending } = useUploadPlayerImage({
		mutation: {
			onSuccess: () => {
				toast.success("Imagem do jogador enviada com sucesso!");
				queryClient.invalidateQueries({ queryKey: getIndexPlayerQueryKey() });
				onOpenChange(false);
			},
			onError: () => {
				toast.error("Não foi possível enviar a imagem do jogador.");
			},
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Enviar imagem de {player.name}</DialogTitle>
				</DialogHeader>

				<Field>
					<FieldLabel>Imagem</FieldLabel>
					<AvatarImageUpload
						onChange={setImage}
						existingImageUrl={getMediaUrl(player.image_url)}
						alt={player.name}
						label="imagem"
					/>
				</Field>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancelar
					</Button>
					<Button
						type="button"
						disabled={!image || isPending}
						onClick={() => {
							if (!image) return;
							mutate({ id: player.id, data: { image } });
						}}
					>
						{isPending ? "Enviando..." : "Enviar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
