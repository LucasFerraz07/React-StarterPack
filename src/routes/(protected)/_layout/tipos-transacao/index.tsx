import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { TransactionTypeCreateDialog } from "@/components/transaction-types/transaction-types-create-dialog";
import { TransactionTypeTable } from "@/components/transaction-types/transaction-types-table";
import { Button } from "@/components/ui/button";
import { ensureRoutePermissions } from "@/utils/route-guards";

const transactionTypeStaticData = {
	requiredPermissions: ["transaction-type.view"],
};
export const Route = createFileRoute("/(protected)/_layout/tipos-transacao/")({
	beforeLoad: () => {
		ensureRoutePermissions(transactionTypeStaticData);
	},
	component: TransactionTypesPage,
});

function TransactionTypesPage() {
	const [createOpen, setCreateOpen] = React.useState(false);

	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex justify-between">
				<div className="flex flex-col justify-center gap-2">
					<h1 className="text-4xl font-extrabold tracking-tight">
						Tipos de Transação
					</h1>
					<p className="text-lg text-muted-foreground">
						Visualize todos os tipos de transação cadastrados no sistema
					</p>
				</div>
				<Button size="lg" onClick={() => setCreateOpen(true)}>
					Cadastrar Tipo de Transação
				</Button>
			</div>
			<TransactionTypeTable />
			<TransactionTypeCreateDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
