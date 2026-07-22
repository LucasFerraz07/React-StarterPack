import type { ColumnDef } from "@tanstack/react-table";
import type { TransactionTypeResource } from "@/api/generated/models/transactionTypeResource";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { transactionOperationLabels } from "@/schemas/transaction-type-schema";
import { TransactionTypeActionsMenu } from "./transaction-types-actions-menu";

export const transactionTypeColumns: ColumnDef<TransactionTypeResource>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nome" className="pl-2" />
		),
		cell: ({ row }) => <div className="pl-2">{row.original.name}</div>,
		meta: { label: "Nome" },
	},
	{
		accessorKey: "description",
		header: "Descrição",
		meta: { label: "Descrição" },
		cell: ({ row }) => row.original.description ?? "—",
	},
	{
		accessorKey: "operation",
		header: "Operação",
		meta: { label: "Operação" },
		cell: ({ row }) => (
			<Badge
				variant={row.original.operation === "credit" ? "default" : "outline"}
			>
				{transactionOperationLabels[
					row.original.operation as keyof typeof transactionOperationLabels
				] ?? row.original.operation}
			</Badge>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end pr-2">
				<TransactionTypeActionsMenu transactionType={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
