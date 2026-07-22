import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
	getIndexClubQueryKey,
	useDestroyClub,
} from "@/api/generated/club/club";
import type { ClubResource } from "@/api/generated/models/clubResource";
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
import { ClubEditDialog } from "./clubs-edit-dialog";

export function ClubActionsMenu({ club }: { club: ClubResource }) {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);

	const { mutate: destroyClub, isPending } = useDestroyClub({
		mutation: {
			onSuccess: () => {
				toast.success("Clube excluído com sucesso!");
				queryClient.invalidateQueries({ queryKey: getIndexClubQueryKey() });
			},
			onError: () => {
				toast.error("Não foi possível excluir o clube.");
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
			<ClubEditDialog club={club} open={editOpen} onOpenChange={setEditOpen} />
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir clube</AlertDialogTitle>
					<AlertDialogDescription>
						Tem certeza que deseja excluir o clube "{club.name}"? Essa ação não
						pode ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={() => destroyClub({ id: club.id })}
					>
						{isPending ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
