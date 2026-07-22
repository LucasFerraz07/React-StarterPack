import type { Table } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	pageSizeOptions?: number[];
	showPageSizeSelector?: boolean;
}

export function DataTablePagination<TData>({
	table,
	pageSizeOptions = [10, 15, 25, 50],
	showPageSizeSelector = true,
}: DataTablePaginationProps<TData>) {
	const { pageIndex, pageSize } = table.getState().pagination;
	const selectedCount = table.getFilteredSelectedRowModel().rows.length;

	return (
		<div className="flex items-center justify-between px-2">
			<div className="text-sm text-muted-foreground">
				{selectedCount > 0
					? `${selectedCount} de ${table.getFilteredRowModel().rows.length} linha(s) selecionada(s).`
					: null}
			</div>
			<div className="flex items-center gap-6">
				{showPageSizeSelector && (
					<div className="flex items-center gap-2">
						<p className="text-sm font-medium">Linhas por página</p>
						<Select
							value={String(pageSize)}
							onValueChange={(value) => table.setPageSize(Number(value))}
						>
							<SelectTrigger size="sm" className="w-16">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
				<div className="flex items-center justify-center text-sm font-medium">
					Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronsLeftIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeftIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<ChevronRightIcon />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="size-8"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<ChevronsRightIcon />
					</Button>
				</div>
			</div>
		</div>
	);
}
