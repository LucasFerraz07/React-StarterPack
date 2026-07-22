import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontalIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
	getIndexLeagueQueryKey,
	useDestroyLeague,
} from "@/api/generated/league/league";
import type { LeagueResource } from "@/api/generated/models/leagueResource";
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
import { LeagueDetailsDialog } from "./leagues-details";

export function LeagueActionsMenu({ league }: { league: LeagueResource }) {
	const queryClient = useQueryClient();
	const [confirmOpen, setConfirmOpen] = React.useState(false);
	const [detailsOpen, setDetailsOpen] = React.useState(false);

	const { mutate: destroyLeague, isPending } = useDestroyLeague({
		mutation: {
			onSuccess: () => {
				toast.success("Liga excluída com sucesso!");
				queryClient.invalidateQueries({ queryKey: getIndexLeagueQueryKey() });
			},
			onError: () => {
				toast.error("Não foi possível excluir a liga.");
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
					<DropdownMenuItem onSelect={() => setDetailsOpen(true)}>
						Ver detalhes
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
			<LeagueDetailsDialog
				leagueId={league.id}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
			/>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir liga</AlertDialogTitle>
					<AlertDialogDescription>
						Tem certeza que deseja excluir a liga "{league.name}"? Essa ação não
						pode ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						onClick={() => destroyLeague({ id: league.id })}
					>
						{isPending ? "Excluindo..." : "Excluir"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
