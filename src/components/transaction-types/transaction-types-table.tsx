import {
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useIndexTransactionType } from "@/api/generated/transaction-type/transaction-type";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { transactionTypeColumns } from "./transaction-types-columns";

export function TransactionTypeTable() {
	const [search, setSearch] = React.useState("");
	const debouncedSearch = useDebouncedValue(search, 400);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const { data, isLoading } = useIndexTransactionType({
		page: pagination.pageIndex + 1,
		per_page: pagination.pageSize,
		search: debouncedSearch || null,
	});

	const transactionTypes = data?.data.data ?? [];
	const pageCount = data?.data.pagination.total_pages ?? 0;

	const table = useReactTable({
		data: transactionTypes,
		columns: transactionTypeColumns,
		getRowId: (transactionType) => transactionType.id,
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
				placeholder="Buscar tipo de transação..."
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPagination((current) => ({ ...current, pageIndex: 0 }));
				}}
				className="max-w-sm"
			/>
			<DataTable
				table={table}
				columnCount={transactionTypeColumns.length}
				isLoading={isLoading}
				emptyMessage="Nenhum tipo de transação encontrado."
			/>
			<DataTablePagination table={table} showPageSizeSelector={false} />
		</div>
	);
}
