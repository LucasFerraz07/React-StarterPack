import type { ColumnDef } from "@tanstack/react-table";
import type { PlayerResource } from "@/api/generated/models/playerResource";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { getMediaUrl } from "@/lib/media";
import { categoryImages, categoryLabels } from "@/lib/player-category";
import { TransferMarketActionsMenu } from "./transfer-market-actions-menu";

function formatCurrency(value: string | null) {
	if (!value) return "—";
	const numericValue = Number(value);
	if (Number.isNaN(numericValue)) return "—";
	return numericValue.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export const transferMarketColumns: ColumnDef<PlayerResource>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Jogador" className="pl-2" />
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-3 py-1 pl-2">
				<Avatar className="size-10 after:border-0">
					<AvatarImage
						src={getMediaUrl(row.original.image_url) ?? undefined}
						alt={row.original.name}
					/>
					<AvatarFallback>
						{row.original.name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span>{row.original.name}</span>
			</div>
		),
		meta: { label: "Jogador" },
	},
	{
		accessorKey: "position",
		header: "Posição",
		meta: { label: "Posição" },
		cell: ({ row }) => row.original.position,
	},
	{
		accessorKey: "overall",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Overall" />
		),
		meta: { label: "Overall" },
		cell: ({ row }) => row.original.overall,
	},
	{
		accessorKey: "category",
		header: "Categoria",
		meta: { label: "Categoria" },
		cell: ({ row }) =>
			row.original.category && categoryImages[row.original.category] ? (
				<img
					src={categoryImages[row.original.category]}
					alt={categoryLabels[row.original.category] ?? row.original.category}
					title={categoryLabels[row.original.category] ?? row.original.category}
					className="size-12"
				/>
			) : (
				"—"
			),
	},
	{
		accessorKey: "owner",
		header: "Contrato",
		cell: ({ row }) => {
			const owner = row.original.owner;
			if (!owner) {
				return <span className="text-muted-foreground">Livre</span>;
			}
			return (
				<div className="flex items-center gap-2">
					<Avatar className="size-6">
						<AvatarImage
							src={owner.club?.crest ?? undefined}
							alt={owner.club?.name}
						/>
						<AvatarFallback>
							{owner.username.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span>{owner.username}</span>
				</div>
			);
		},
	},
	{
		accessorKey: "passe",
		header: "Passe",
		cell: ({ row }) => formatCurrency(row.original.passe),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end pr-2">
				<TransferMarketActionsMenu player={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
