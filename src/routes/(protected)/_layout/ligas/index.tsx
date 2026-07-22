import { createFileRoute, Link } from "@tanstack/react-router";
import { LeagueTable } from "@/components/leagues/leagues-table";
import { Button } from "@/components/ui/button";
import { ensureRoutePermissions } from "@/utils/route-guards";
import { routes } from "@/utils/routes";

const leagueStaticData = {
	requiredPermissions: ["league.view"],
};
export const Route = createFileRoute("/(protected)/_layout/ligas/")({
	beforeLoad: () => {
		ensureRoutePermissions(leagueStaticData);
	},
	component: LeaguesPage,
});

function LeaguesPage() {
	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex justify-between">
				<div className="flex flex-col justify-center gap-2">
					<h1 className="text-4xl font-extrabold tracking-tight">Ligas</h1>
					<p className="text-lg text-muted-foreground">
						Visualize todas as ligas cadastradas no sistema
					</p>
				</div>
				<Button asChild size="lg">
					<Link to={routes.leagues.new}>Cadastrar Liga</Link>
				</Button>
			</div>
			<LeagueTable />
		</div>
	);
}
