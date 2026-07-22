import {
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useIndexPlayer } from "@/api/generated/player/player";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { transferMarketColumns } from "./transfer-market-columns";

export function TransferMarketTable() {
	const [search, setSearch] = React.useState("");
	const debouncedSearch = useDebouncedValue(search, 400);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const { data, isLoading } = useIndexPlayer({
		page: pagination.pageIndex + 1,
		per_page: pagination.pageSize,
		search: debouncedSearch || null,
	});

	const players = data?.data.data ?? [];
	const pageCount = data?.data.pagination.total_pages ?? 0;

	const table = useReactTable({
		data: players,
		columns: transferMarketColumns,
		getRowId: (player) => player.id,
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
				placeholder="Buscar jogador..."
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPagination((current) => ({ ...current, pageIndex: 0 }));
				}}
				className="max-w-sm"
			/>
			<DataTable
				table={table}
				columnCount={transferMarketColumns.length}
				isLoading={isLoading}
				emptyMessage="Nenhum jogador encontrado."
			/>
			<DataTablePagination table={table} showPageSizeSelector={false} />
		</div>
	);
}
