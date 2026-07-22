import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import type { TransactionTypeResource } from "@/api/generated/models/transactionTypeResource";
import {
	getIndexTransactionTypeQueryKey,
	useDestroyTransactionType,
} from "@/api/generated/transaction-type/transaction-type";
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
import { TransactionTypeEditDialog } from "./transaction-types-edit-dialog";

export function TransactionTypeActionsMenu({
	transactionType,
}: {
	transactionType: TransactionTypeResource;
}) {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);

	const { mutate: destroyTransactionType, isPending } =
		useDestroyTransactionType({
			mutation: {
				onSuccess: () => {
					toast.success("Tipo de transação excluído com sucesso!");
					queryClient.invalidateQueries({
						queryKey: getIndexTransactionTypeQueryKey(),
					});
				},
				onError: () => {
					toast.error("Não foi possível excluir o tipo de transação.");
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
			<TransactionTypeEditDialog
				transactionType={transactionType}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir tipo de transação</AlertDialogTitle>
					<AlertDialogDescription>
						Tem certeza que deseja excluir o tipo de transação "
						{transactionType.name}"? Essa ação não pode ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={() => destroyTransactionType({ id: transactionType.id })}
					>
						{isPending ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
