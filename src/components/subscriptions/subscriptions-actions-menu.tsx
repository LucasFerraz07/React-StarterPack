import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { SubscriptionResource } from "@/api/generated/models/subscriptionResource";
import {
	getIndexSubscriptionQueryKey,
	useDestroySubscription,
} from "@/api/generated/subscription/subscription";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionEditDialog } from "./subscriptions-edit-dialog";

export function SubscriptionActionsMenu({
	subscription,
}: {
	subscription: SubscriptionResource;
}) {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);

	const { mutate: destroySubscription, isPending } = useDestroySubscription({
		mutation: {
			onSuccess: () => {
				toast.success("Assinatura excluída com sucesso!");
				queryClient.invalidateQueries({
					queryKey: getIndexSubscriptionQueryKey(),
				});
			},
			onError: () => {
				toast.error("Não foi possível excluir a assinatura.");
			},
			onSettled: () => {
				setConfirmOpen(false);
			},
		},
	});

	return (
		<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="size-8">
						<MoreHorizontalIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => setEditOpen(true)}>
						Editar
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							variant="destructive"
							onSelect={(event) => event.preventDefault()}
						>
							Excluir
						</DropdownMenuItem>
					</AlertDialogTrigger>
				</DropdownMenuContent>
			</DropdownMenu>
			<SubscriptionEditDialog
				subscription={subscription}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir assinatura</AlertDialogTitle>
					<AlertDialogDescription>
						Tem certeza que deseja excluir a assinatura "{subscription.name}"?
						Essa ação não pode ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={() => destroySubscription({ id: subscription.id })}
					>
						{isPending ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
