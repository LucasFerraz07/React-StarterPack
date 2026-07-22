import { createFileRoute } from "@tanstack/react-router";
import { LeagueShow } from "@/components/leagues/leagues-show";
import { useAuthStore } from "@/stores/auth-store";
import { ensureRoutePermissions } from "@/utils/route-guards";

const leagueSettingsStaticData = {
	requiredPermissions: ["league.view"],
	deniedPermissions: ["league.create"],
};
export const Route = createFileRoute("/(protected)/_layout/ligas/configuracoes")({
	beforeLoad: () => {
		ensureRoutePermissions(leagueSettingsStaticData);
	},
	component: LeagueSettingsPage,
});

function LeagueSettingsPage() {
	const leagueId = useAuthStore((state) => state.user?.league_id);

	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex flex-col justify-center gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight">Minha Liga</h1>
				<p className="text-lg text-muted-foreground">
					Visualize e gerencie as informações da sua liga
				</p>
			</div>
			{leagueId ? (
				<LeagueShow leagueId={leagueId} />
			) : (
				<p className="text-sm text-destructive">
					Nenhuma liga associada ao seu usuário.
				</p>
			)}
		</div>
	);
}
