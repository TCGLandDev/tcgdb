import { IconLayoutColumns, IconPlus, IconRefresh } from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface EntityDataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	createLabel?: string;
	onCreate?: () => void;
	onRefresh?: () => void;
	isRefreshing?: boolean;
	selectable?: boolean;
	className?: string;
	isLoading?: boolean;
}

export function EntityDataTable<TData>({
	columns,
	data,
	searchKey,
	searchPlaceholder = "Search",
	createLabel = "Add",
	onCreate,
	onRefresh,
	isRefreshing,
	selectable = true,
	className,
	isLoading = false,
}: EntityDataTableProps<TData>) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);

	const toggleColumnVisibility = (columnId: string, value: boolean) => {
		setColumnVisibility((prev) => ({ ...prev, [columnId]: value }));
	};

	const internalColumns = React.useMemo(() => {
		if (!selectable) {
			return columns;
		}
		const selectColumn: ColumnDef<TData> = {
			id: "select",
			enableSorting: false,
			enableHiding: false,
			header: ({ table }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						aria-label="Select all rows"
						onCheckedChange={(value) =>
							table.toggleAllPageRowsSelected(!!value)
						}
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<Checkbox
						checked={row.getIsSelected()}
						aria-label="Select row"
						onCheckedChange={(value) => row.toggleSelected(!!value)}
					/>
				</div>
			),
		};
		return [selectColumn, ...columns];
	}, [columns, selectable]);

	const table = useReactTable({
		data,
		columns: internalColumns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: selectable,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	const searchColumn = searchKey ? table.getColumn(searchKey) : undefined;

	return (
		<div className={cn("space-y-4", className)}>
			<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
				<div className="flex flex-1 items-center gap-2">
					{searchColumn && (
						<Input
							placeholder={searchPlaceholder}
							className="w-full max-w-sm"
							value={(searchColumn.getFilterValue() as string) ?? ""}
							onChange={(event) =>
								searchColumn.setFilterValue(event.target.value)
							}
						/>
					)}
					{onRefresh && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="shrink-0"
							onClick={() => onRefresh()}
							disabled={isRefreshing}
						>
							<IconRefresh
								className={cn("mr-2 size-4", isRefreshing && "animate-spin")}
							/>
							Refresh
						</Button>
					)}
				</div>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
							>
								<IconLayoutColumns className="size-4" />
								View
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide(),
								)
								.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											toggleColumnVisibility(column.id, !!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								))}
						</DropdownMenuContent>
					</DropdownMenu>
					{onCreate && (
						<Button type="button" size="sm" onClick={() => onCreate()}>
							<IconPlus className="mr-2 size-4" />
							{createLabel}
						</Button>
					)}
				</div>
			</div>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader className="bg-muted/40">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={internalColumns.length}
									className="h-24 text-center"
								>
									Loading entries…
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="transition-colors"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={internalColumns.length}
									className="h-24 text-center"
								>
									No records found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
