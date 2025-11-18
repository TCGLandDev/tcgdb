import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export interface ResourcePaginationProps {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	onChangePage: (nextPage: number) => void;
	onChangePageSize?: (pageSize: number) => void;
	isLoading?: boolean;
}

export function ResourcePagination({
	page,
	pageSize,
	totalItems,
	totalPages,
	onChangePage,
	onChangePageSize,
	isLoading,
}: ResourcePaginationProps) {
	const canGoBack = page > 1;
	const canGoForward = page < totalPages;

	return (
		<div className="flex flex-col gap-3 border-t px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
			<div className="flex items-center gap-2">
				<span>Rows per page</span>
				<Select
					value={String(pageSize)}
					onValueChange={(value) => onChangePageSize?.(Number(value))}
					disabled={isLoading || !onChangePageSize}
				>
					<SelectTrigger className="h-8 w-[90px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAGE_SIZE_OPTIONS.map((option) => (
							<SelectItem key={option} value={String(option)}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center gap-4">
				<span>
					Page {page} of {Math.max(totalPages, 1)} · {totalItems} total
				</span>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onChangePage(page - 1)}
						disabled={!canGoBack || isLoading}
					>
						Previous
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onChangePage(page + 1)}
						disabled={!canGoForward || isLoading}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
