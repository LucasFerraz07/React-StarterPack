import type { ColumnDef } from "@tanstack/react-table";
import type { ClubResource } from "@/api/generated/models/clubResource";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { getMediaUrl } from "@/lib/media";
import { clubRegionLabels } from "@/schemas/club-schema";
import { ClubActionsMenu } from "./clubs-actions-menu";

export const clubColumns: ColumnDef<ClubResource>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Clube" className="pl-2" />
		),
		cell: ({ row }) => (
			<div className="flex items-center gap-3 py-1 pl-2">
				<Avatar className="size-12 after:border-0">
					<AvatarImage
						src={getMediaUrl(row.original.crest) ?? undefined}
						alt={row.original.name}
					/>
					<AvatarFallback>
						{row.original.name.slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<span>{row.original.name}</span>
			</div>
		),
		meta: { label: "Clube" },
	},
	{
		accessorKey: "region",
		header: "Região",
		meta: { label: "Região" },
		cell: ({ row }) => (
			<Badge variant="outline">
				{clubRegionLabels[
					row.original.region as keyof typeof clubRegionLabels
				] ?? row.original.region}
			</Badge>
		),
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end pr-2">
				<ClubActionsMenu club={row.original} />
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
];
