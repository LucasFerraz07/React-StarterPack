import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { SubscriptionCreateDialog } from "@/components/subscriptions/subscriptions-create-dialog";
import { SubscriptionTable } from "@/components/subscriptions/subscriptions-table";
import { Button } from "@/components/ui/button";
import { ensureRoutePermissions } from "@/utils/route-guards";

const subscriptionStaticData = {
	requiredPermissions: ["subscription.view"],
};
export const Route = createFileRoute("/(protected)/_layout/assinaturas/")({
	beforeLoad: () => {
		ensureRoutePermissions(subscriptionStaticData);
	},
	component: SubscriptionsPage,
});

function SubscriptionsPage() {
	const [createOpen, setCreateOpen] = React.useState(false);

	return (
		<div className="flex flex-col justify-center gap-4 p-12">
			<div className="flex justify-between">
				<div className="flex flex-col justify-center gap-2">
					<h1 className="text-4xl font-extrabold tracking-tight">
						Assinaturas
					</h1>
					<p className="text-lg text-muted-foreground">
						Visualize todas as assinaturas cadastradas no sistema
					</p>
				</div>
				<Button size="lg" onClick={() => setCreateOpen(true)}>
					Cadastrar Assinatura
				</Button>
			</div>
			<SubscriptionTable />
			<SubscriptionCreateDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
			/>
		</div>
	);
}
