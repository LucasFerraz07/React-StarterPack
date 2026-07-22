import { ImageUpIcon } from "lucide-react";
import * as React from "react";
import type { PlayerResource } from "@/api/generated/models/playerResource";
import { Button } from "@/components/ui/button";
import { PlayerImageUploadDialog } from "./player-image-upload-dialog";

export function PlayerImageActions({ player }: { player: PlayerResource }) {
	const [uploadOpen, setUploadOpen] = React.useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() => setUploadOpen(true)}
			>
				<ImageUpIcon />
				Enviar imagem
			</Button>
			<PlayerImageUploadDialog
				player={player}
				open={uploadOpen}
				onOpenChange={setUploadOpen}
			/>
		</>
	);
}
