import { createFileRoute } from "@tanstack/react-router";
import { LeagueForm } from "@/components/leagues/leagues-form";
import { ensureRoutePermissions } from "@/utils/route-guards";

const createLeagueStaticData = {
	requiredPermissions: ["league.create"],
};
export const Route = createFileRoute("/(protected)/_layout/ligas/ligas-criar")({
	beforeLoad: () => {
		ensureRoutePermissions(createLeagueStaticData);
	},
	component: CreateLeaguePage,
});

function CreateLeaguePage() {
	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex flex-col justify-center gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight">
					Cadastrar Liga
				</h1>
				<p className="text-lg text-muted-foreground">
					Cadastre uma nova liga no sistema
				</p>
			</div>
			<LeagueForm />
		</div>
	);
}
