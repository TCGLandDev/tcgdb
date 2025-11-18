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
import {
	usePokemonSetDeleteMutation,
	usePokemonSetsQuery,
} from "@/domains/pokemon-sets";

interface PokemonSetRow {
	entityId: string;
	slug: string;
	name: string;
	series: string;
	path: string;
	printedTotal: number;
	releaseDate: string;
	legalities: string[];
}

export default function PokemonSetsPage() {
	const navigate = useNavigate();
	const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
	const pokemonSetsQuery = usePokemonSetsQuery(pagination);
	const deleteMutation = usePokemonSetDeleteMutation();

	const tableData: PokemonSetRow[] = useMemo(() => {
		return (pokemonSetsQuery.data?.items ?? []).map((record) => ({
			entityId: record.entityId,
			slug: record.payload.id,
			name: record.payload.name,
			series: record.payload.series,
			path: record.payload.path,
			printedTotal: record.payload.printedTotal,
			releaseDate: record.payload.releaseDate,
			legalities: record.payload.legalities ?? [],
		}));
	}, [pokemonSetsQuery.data]);

	const columns = useMemo<ColumnDef<PokemonSetRow>[]>(() => {
		return [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<div>
						<div className="font-medium text-foreground">
							{row.original.name}
						</div>
						<div className="text-xs text-muted-foreground">
							{row.original.path}
						</div>
					</div>
				),
			},
			{
				accessorKey: "series",
				header: "Series",
				cell: ({ row }) => (
					<Badge variant="outline" className="font-normal">
						{row.original.series}
					</Badge>
				),
			},
			{
				accessorKey: "printedTotal",
				header: "Cards",
				cell: ({ row }) => <span>{row.original.printedTotal}</span>,
			},
			{
				accessorKey: "releaseDate",
				header: "Release",
				cell: ({ row }) => {
					const date = new Date(row.original.releaseDate);
					return (
						<div className="text-sm">
							{Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString()}
						</div>
					);
				},
			},
			{
				accessorKey: "legalities",
				header: "Formats",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						{row.original.legalities.map((format) => (
							<Badge key={format} variant="secondary">
								{format}
							</Badge>
						))}
						{row.original.legalities.length === 0 && (
							<span className="text-xs text-muted-foreground">—</span>
						)}
					</div>
				),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<RowActions
						onEdit={() => navigate(`/pkm/sets/${row.original.entityId}/edit`)}
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

	const pageMeta = pokemonSetsQuery.data;

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold">Pokémon Sets</h1>
				<p className="text-sm text-muted-foreground">
					Manage normalized Pokémon set records backed by the persistence SDK.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Sets</CardTitle>
					<CardDescription>
						Use the toolbar to add, filter, or refresh the list.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<EntityDataTable
						columns={columns}
						data={tableData}
						searchKey="name"
						onCreate={() => navigate("/pkm/sets/new")}
						createLabel="Add set"
						onRefresh={() => pokemonSetsQuery.refetch()}
						isRefreshing={pokemonSetsQuery.isFetching}
						isLoading={pokemonSetsQuery.isLoading}
					/>
					<ResourcePagination
						page={pageMeta?.page ?? pagination.page}
						pageSize={pageMeta?.pageSize ?? pagination.pageSize}
						totalItems={pageMeta?.totalItems ?? 0}
						totalPages={pageMeta?.totalPages ?? 1}
						onChangePage={(page) =>
							setPagination((prev) => ({ ...prev, page }))
						}
						onChangePageSize={(pageSize) =>
							setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
						}
						isLoading={pokemonSetsQuery.isFetching}
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
				<Button variant="ghost" size="icon" className="size-8">
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
							<AlertDialogTitle>Delete this set?</AlertDialogTitle>
							<AlertDialogDescription>
								This action soft-deletes the entity via the persistence layer.
								You can recreate it later if needed.
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
