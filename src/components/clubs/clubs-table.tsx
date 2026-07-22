import {
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useIndexClub } from "@/api/generated/club/club";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { clubColumns } from "./clubs-columns";

export function ClubTable() {
	const [search, setSearch] = React.useState("");
	const debouncedSearch = useDebouncedValue(search, 400);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const { data, isLoading } = useIndexClub({
		page: pagination.pageIndex + 1,
		per_page: pagination.pageSize,
		search: debouncedSearch || null,
	});

	const clubs = data?.data.data ?? [];
	const pageCount = data?.data.pagination.total_pages ?? 0;

	const table = useReactTable({
		data: clubs,
		columns: clubColumns,
		getRowId: (club) => club.id,
		manualPagination: true,
		pageCount,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		state: {
			sorting,
			pagination,
		},
	});

	return (
		<div className="flex flex-col gap-4">
			<Input
				placeholder="Buscar clube..."
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPagination((current) => ({ ...current, pageIndex: 0 }));
				}}
				className="max-w-sm"
			/>
			<DataTable
				table={table}
				columnCount={clubColumns.length}
				isLoading={isLoading}
				emptyMessage="Nenhum clube encontrado."
			/>
			<DataTablePagination table={table} showPageSizeSelector={false} />
		</div>
	);
}
