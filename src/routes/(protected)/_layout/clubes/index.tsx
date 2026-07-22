import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { ClubCreateDialog } from "@/components/clubs/clubs-create-dialog";
import { ClubTable } from "@/components/clubs/clubs-table";
import { Button } from "@/components/ui/button";
import { ensureRoutePermissions } from "@/utils/route-guards";

const clubStaticData = {
	requiredPermissions: ["club.view"],
};
export const Route = createFileRoute("/(protected)/_layout/clubes/")({
	beforeLoad: () => {
		ensureRoutePermissions(clubStaticData);
	},
	component: ClubsPage,
});

function ClubsPage() {
	const [createOpen, setCreateOpen] = React.useState(false);

	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex justify-between">
				<div className="flex flex-col justify-center gap-2">
					<h1 className="text-4xl font-extrabold tracking-tight">Clubes</h1>
					<p className="text-lg text-muted-foreground">
						Visualize todos os clubes cadastrados no sistema
					</p>
				</div>
				<Button size="lg" onClick={() => setCreateOpen(true)}>
					Cadastrar Clube
				</Button>
			</div>
			<ClubTable />
			<ClubCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}
