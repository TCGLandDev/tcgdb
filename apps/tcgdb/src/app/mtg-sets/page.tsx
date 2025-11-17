import { IconDotsVertical } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { EntityDataTable } from "@/components/entity-data-table";
import { ResourcePagination } from "@/components/resource-pagination";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMtgSetDeleteMutation, useMtgSetsQuery } from "@/domains/mtg-sets";

interface MtgSetRow {
	entityId: string;
	id: string;
	name: string;
	path: string;
	numberCardsInSet: number;
}

export default function MtgSetsPage() {
	const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
	const mtgSetsQuery = useMtgSetsQuery(pagination);
	const deleteMutation = useMtgSetDeleteMutation();
	const navigate = useNavigate();

	const tableData: MtgSetRow[] = useMemo(() => {
		return (mtgSetsQuery.data?.items ?? []).map((record) => ({
			entityId: record.entityId,
			id: record.payload.id,
			name: record.payload.name,
			path: record.payload.path,
			numberCardsInSet: record.payload.numberCardsInSet,
		}));
	}, [mtgSetsQuery.data]);

	const columns = useMemo<ColumnDef<MtgSetRow>[]>(() => {
		return [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<div>
						<div className="font-medium">{row.original.name}</div>
						<div className="text-xs text-muted-foreground">
							{row.original.path}
						</div>
					</div>
				),
			},
			{
				accessorKey: "id",
				header: "Code",
				cell: ({ row }) => <Badge variant="outline">{row.original.id}</Badge>,
			},
			{
				accessorKey: "numberCardsInSet",
				header: "Cards",
				cell: ({ row }) => <span>{row.original.numberCardsInSet}</span>,
			},
			{
				id: "actions",
				cell: ({ row }) => (
					<RowActions
						onEdit={() => navigate(`/mtg/sets/${row.original.entityId}/edit`)}
						onDelete={async () => {
							try {
								await deleteMutation.mutateAsync(row.original.entityId);
								toast.success("Set deleted");
							} catch (error) {
								console.error(error);
								toast.error("Failed to delete set");
							}
						}}
						isDeleting={deleteMutation.isPending}
					/>
				),
			},
		];
	}, [deleteMutation, navigate]);

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold">Magic: The Gathering Sets</h1>
				<p className="text-sm text-muted-foreground">
					Curate MTG set metadata from the persistence layer.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Sets</CardTitle>
					<CardDescription>View, edit, or remove MTG sets.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<EntityDataTable
						columns={columns}
						data={tableData}
						searchKey="name"
						onCreate={() => navigate("/mtg/sets/new")}
						createLabel="Add set"
						onRefresh={() => mtgSetsQuery.refetch()}
						isRefreshing={mtgSetsQuery.isFetching}
						isLoading={mtgSetsQuery.isLoading}
					/>
					<ResourcePagination
						page={mtgSetsQuery.data?.page ?? pagination.page}
						pageSize={mtgSetsQuery.data?.pageSize ?? pagination.pageSize}
						totalItems={mtgSetsQuery.data?.totalItems ?? 0}
						totalPages={mtgSetsQuery.data?.totalPages ?? 1}
						onChangePage={(page) =>
							setPagination((prev) => ({ ...prev, page }))
						}
						onChangePageSize={(pageSize) =>
							setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
						}
						isLoading={mtgSetsQuery.isFetching}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

type RowActionsProps = {
	onEdit: () => void;
	onDelete: () => Promise<void>;
	isDeleting: boolean;
};

function RowActions({ onEdit, onDelete, isDeleting }: RowActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon">
					<IconDotsVertical className="size-4" />
					<span className="sr-only">Open row actions</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem className="text-destructive focus:text-destructive">
							Delete
						</DropdownMenuItem>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete this MTG set?</AlertDialogTitle>
							<AlertDialogDescription>
								This removes the entity from the active catalog.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => onDelete()}
								disabled={isDeleting}
							>
								{isDeleting ? "Deleting…" : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
