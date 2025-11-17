import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PokemonSetForm } from "@/app/pkm-sets/pokemon-set-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	toPokemonSetFormValues,
	usePokemonSetQuery,
	usePokemonSetSaveMutation,
} from "@/domains/pokemon-sets";

export default function PokemonSetsEditPage() {
	const { entityId } = useParams<{ entityId: string }>();
	const navigate = useNavigate();
	const pokemonSetQuery = usePokemonSetQuery(entityId);
	const saveMutation = usePokemonSetSaveMutation();

	const defaultValues = useMemo(() => {
		if (!pokemonSetQuery.data) {
			return toPokemonSetFormValues();
		}
		return toPokemonSetFormValues(pokemonSetQuery.data);
	}, [pokemonSetQuery.data]);

	async function handleSubmit(
		values: ReturnType<typeof toPokemonSetFormValues>,
	) {
		if (!entityId) return;
		try {
			await saveMutation.mutateAsync({ entityId, values });
			toast.success("Set updated");
			navigate("/pkm/sets");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update set");
		}
	}

	if (!entityId) {
		return (
			<div className="p-6">
				<p className="text-sm text-destructive">Missing entity id.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Edit Pokémon Set</h1>
					<p className="text-sm text-muted-foreground">
						Update the normalized schema fields for this record.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/pkm/sets")}>
					Back to list
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Set details</CardTitle>
					<CardDescription>
						Changes flow through the persistence SDK immediately.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{pokemonSetQuery.isLoading ? (
						<Skeleton className="h-96 w-full" />
					) : pokemonSetQuery.data ? (
						<PokemonSetForm
							key={pokemonSetQuery.data.entityId}
							defaultValues={defaultValues}
							onSubmit={handleSubmit}
							isSubmitting={saveMutation.isPending}
							submitLabel="Save changes"
						/>
					) : (
						<p className="text-sm text-destructive">Set not found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
