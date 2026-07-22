import type { ColumnDef } from "@tanstack/react-table";
import type { SubscriptionResource } from "@/api/generated/models/subscriptionResource";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { SubscriptionActionsMenu } from "./subscriptions-actions-menu";

function formatCurrency(value: string) {
	const numericValue = Number(value);
	if (Number.isNaN(numericValue)) return "—";
	return numericValue.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

export const subscriptionColumns: ColumnDef<SubscriptionResource>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title="Assinatura"
				className="pl-2"
			/>
		),
		cell: ({ row }) => <div className="pl-2">{row.original.name}</div>,
		meta: { label: "Assinatura" },
	},
	{
		accessorKey: "user_limit",
		header: "Limite de Usuários",
		meta: { label: "Limite de Usuários" },
		cell: ({ row }) => row.original.user_limit ?? "Sem limite",
	},
	{
		accessorKey: "price",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Preço" />
		),
		meta: { label: "Preço" },
		cell: ({ row }) => formatCurrency(row.original.price),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end pr-2">
				<SubscriptionActionsMenu subscription={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
