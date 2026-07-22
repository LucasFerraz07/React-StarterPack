import {
	getCoreRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useIndexSubscription } from "@/api/generated/subscription/subscription";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { subscriptionColumns } from "./subscriptions-columns";

export function SubscriptionTable() {
	const [search, setSearch] = React.useState("");
	const debouncedSearch = useDebouncedValue(search, 400);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const { data, isLoading } = useIndexSubscription({
		page: pagination.pageIndex + 1,
		per_page: pagination.pageSize,
		search: debouncedSearch || null,
	});

	const subscriptions = data?.data.data ?? [];
	const pageCount = data?.data.pagination.total_pages ?? 0;

	const table = useReactTable({
		data: subscriptions,
		columns: subscriptionColumns,
		getRowId: (subscription) => subscription.id,
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
				placeholder="Buscar assinatura..."
				value={search}
				onChange={(event) => {
					setSearch(event.target.value);
					setPagination((current) => ({ ...current, pageIndex: 0 }));
				}}
				className="max-w-sm"
			/>
			<DataTable
				table={table}
				columnCount={subscriptionColumns.length}
				isLoading={isLoading}
				emptyMessage="Nenhuma assinatura encontrada."
			/>
			<DataTablePagination table={table} showPageSizeSelector={false} />
		</div>
	);
}
