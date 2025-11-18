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
	usePokemonSingleDeleteMutation,
	usePokemonSinglesQuery,
} from "@/domains/pokemon-singles";

interface PokemonSingleRow {
	entityId: string;
	tcgLandPublicId: string;
	name: string;
	number: string;
	supertype: string;
	path: string;
	lang: string;
	types: string[];
	tcgPlayerIds: number[];
	legalities: { format: string; status: string }[];
	image?: string;
}

export default function PokemonSinglesPage() {
	const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });
	const singlesQuery = usePokemonSinglesQuery(pagination);
	const deleteMutation = usePokemonSingleDeleteMutation();
	const navigate = useNavigate();

	const tableData: PokemonSingleRow[] = useMemo(() => {
		return (singlesQuery.data?.items ?? []).map((record) => ({
			entityId: record.entityId,
			tcgLandPublicId: record.payload.tcgLandPublicId,
			name: record.payload.name,
			number: record.payload.number,
			supertype: record.payload.supertype,
			path: record.payload.path,
			lang: record.payload.lang,
			types: record.payload.types ?? [],
			tcgPlayerIds: record.payload.tcgPlayerIds ?? [],
			legalities: Object.entries(record.payload.legalities ?? {}).map(
				([format, status]) => ({ format, status }),
			),
			image: record.payload.images?.small,
		}));
	}, [singlesQuery.data]);

	const columns = useMemo<ColumnDef<PokemonSingleRow>[]>(() => {
		return [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						{row.original.image && (
							<img
								src={row.original.image}
								alt={row.original.name}
								className="size-10 rounded border object-cover"
							/>
						)}
						<div>
							<div className="font-medium">{row.original.name}</div>
							<div className="text-xs text-muted-foreground">
								{row.original.path}
							</div>
						</div>
					</div>
				),
			},
			{
				accessorKey: "number",
				header: "Number",
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.number}
						<div className="text-xs text-muted-foreground">
							{row.original.lang}
						</div>
					</div>
				),
			},
			{
				accessorKey: "supertype",
				header: "Supertype",
				cell: ({ row }) => (
					<Badge variant="outline">{row.original.supertype}</Badge>
				),
			},
			{
				accessorKey: "types",
				header: "Types",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						{row.original.types.map((type) => (
							<Badge key={type} variant="secondary">
								{type}
							</Badge>
						))}
						{row.original.types.length === 0 && (
							<span className="text-xs text-muted-foreground">—</span>
						)}
					</div>
				),
			},
			{
				accessorKey: "tcgPlayerIds",
				header: "TCGplayer IDs",
				cell: ({ row }) => (
					<div className="text-sm">
						{row.original.tcgPlayerIds.join(", ") || "—"}
					</div>
				),
			},
			{
				accessorKey: "legalities",
				header: "Legalities",
				cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						{row.original.legalities.map((entry) => (
							<Badge key={entry.format} variant="outline">
								{entry.format}: {entry.status}
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
				cell: ({ row }) => (
					<RowActions
						onEdit={() =>
							navigate(`/pkm/singles/${row.original.entityId}/edit`)
						}
						onDelete={async () => {
							try {
								await deleteMutation.mutateAsync(row.original.entityId);
								toast.success("Card deleted");
							} catch (error) {
								console.error(error);
								toast.error("Failed to delete card");
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
				<h1 className="text-2xl font-semibold">Pokémon Singles</h1>
				<p className="text-sm text-muted-foreground">
					Work with normalized Pokémon card data via the persistence SDK.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Cards</CardTitle>
					<CardDescription>
						Search, edit, or delete card entries.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<EntityDataTable
						columns={columns}
						data={tableData}
						searchKey="name"
						onCreate={() => navigate("/pkm/singles/new")}
						createLabel="Add card"
						onRefresh={() => singlesQuery.refetch()}
						isRefreshing={singlesQuery.isFetching}
						isLoading={singlesQuery.isLoading}
					/>
					<ResourcePagination
						page={singlesQuery.data?.page ?? pagination.page}
						pageSize={singlesQuery.data?.pageSize ?? pagination.pageSize}
						totalItems={singlesQuery.data?.totalItems ?? 0}
						totalPages={singlesQuery.data?.totalPages ?? 1}
						onChangePage={(page) =>
							setPagination((prev) => ({ ...prev, page }))
						}
						onChangePageSize={(pageSize) =>
							setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
						}
						isLoading={singlesQuery.isFetching}
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
							<AlertDialogTitle>Delete this card?</AlertDialogTitle>
							<AlertDialogDescription>
								This operation cannot be undone and will mark the entity as
								deleted.
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
