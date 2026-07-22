import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { LeagueResource } from "@/api/generated/models/leagueResource";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { LeagueActionsMenu } from "./leagues-actions-menu";

function formatDate(value: string) {
	return format(new Date(value), "dd/MM/yyyy");
}

export const leagueColumns: ColumnDef<LeagueResource>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Liga" className="pl-2" />
		),
		cell: ({ row }) => <div className="pl-2">{row.original.name}</div>,
		meta: { label: "Liga" },
	},
	{
		id: "owner",
		accessorFn: (league) => league.owner?.full_name ?? "",
		header: "Responsável",
		meta: { label: "Responsável" },
		cell: ({ row }) => row.original.owner?.full_name ?? "—",
	},
	{
		id: "subscription",
		accessorFn: (league) => league.subscription?.name ?? "",
		header: "Assinatura",
		meta: { label: "Assinatura" },
		cell: ({ row }) => row.original.subscription?.name ?? "—",
	},
	{
		accessorKey: "subscription_end",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Vence em" />
		),
		meta: { label: "Vence em" },
		cell: ({ row }) => formatDate(row.original.subscription_end),
	},
	{
		accessorKey: "is_active",
		header: "Status",
		meta: { label: "Status" },
		cell: ({ row }) =>
			row.original.is_active ? (
				<Badge variant="default">Ativa</Badge>
			) : (
				<Badge variant="outline">Inativa</Badge>
			),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end pr-2">
				<LeagueActionsMenu league={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
