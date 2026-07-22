import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.ComponentProps<"div"> {
	column: Column<TData, TValue>;
	title: string;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
	...props
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	const sorted = column.getIsSorted();

	return (
		<div className={cn("flex items-center", className)} {...props}>
			<Button
				variant="ghost"
				size="sm"
				className="-ml-2.5 h-8"
				onClick={() => column.toggleSorting(sorted === "asc")}
			>
				{title}
				{sorted === "asc" ? (
					<ArrowUpIcon />
				) : sorted === "desc" ? (
					<ArrowDownIcon />
				) : (
					<ChevronsUpDownIcon className="text-muted-foreground" />
				)}
			</Button>
		</div>
	);
}
