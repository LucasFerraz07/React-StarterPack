import { createFileRoute } from "@tanstack/react-router";
import { TransferMarketTable } from "@/components/transfer-market/transfer-market-table";
import { ensureRoutePermissions } from "@/utils/route-guards";

const playerStaticData = {
	requiredPermissions: ["player.view"],
};
export const Route = createFileRoute("/(protected)/_layout/mercado/contratar")({
	beforeLoad: () => {
		ensureRoutePermissions(playerStaticData);
	},
	component: ContractPage,
});

function ContractPage() {
	return(
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex flex-col justify-center gap-2">
				<h1 className="text-4xl font-extrabold tracking-tight">Contratações</h1>
				<p className="text-lg text-muted-foreground">
					Contrate jogadores livres no mercado ou faça proposta para outros jogadores
				</p>
			</div>

			<TransferMarketTable />
		</div>
	);
}
