import { createFileRoute } from "@tanstack/react-router";
import { PlayerImageTable } from "@/components/players/player-image-table";
import { ensureRoutePermissions } from "@/utils/route-guards";

const playerImageStaticData = {
	requiredPermissions: ["player.update"],
};
export const Route = createFileRoute("/(protected)/_layout/jogadores/imagem")({
	beforeLoad: () => {
		ensureRoutePermissions(playerImageStaticData);
	},
	component: PlayerImagePage,
});

function PlayerImagePage() {
	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex flex-col justify-center gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight">
					Imagem dos Jogadores
				</h1>
				<p className="text-lg text-muted-foreground">
					Envie ou atualize a imagem de um jogador do catálogo
				</p>
			</div>
			<PlayerImageTable />
		</div>
	);
}
