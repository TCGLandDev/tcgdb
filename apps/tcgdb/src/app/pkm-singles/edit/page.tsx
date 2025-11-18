import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { PokemonSingleForm } from "@/app/pkm-singles/pokemon-single-form";
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
	toPokemonSingleFormValues,
	usePokemonSingleQuery,
	usePokemonSingleSaveMutation,
} from "@/domains/pokemon-singles";

export default function PokemonSinglesEditPage() {
	const { entityId } = useParams<{ entityId: string }>();
	const navigate = useNavigate();
	const singleQuery = usePokemonSingleQuery(entityId);
	const saveMutation = usePokemonSingleSaveMutation();

	const defaultValues = useMemo(() => {
		if (!singleQuery.data) {
			return toPokemonSingleFormValues();
		}
		return toPokemonSingleFormValues(singleQuery.data);
	}, [singleQuery.data]);

	async function handleSubmit(
		values: ReturnType<typeof toPokemonSingleFormValues>,
	) {
		if (!entityId) return;
		try {
			await saveMutation.mutateAsync({ entityId, values });
			toast.success("Card updated");
			navigate("/pkm/singles");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update card");
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
					<h1 className="text-2xl font-semibold">Edit Pokémon Card</h1>
					<p className="text-sm text-muted-foreground">
						Adjust any of the normalized card fields below.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/pkm/singles")}>
					Back
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Card details</CardTitle>
					<CardDescription>
						Changes sync through @zengateglobal/persistence-sdk.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{singleQuery.isLoading ? (
						<Skeleton className="h-96 w-full" />
					) : singleQuery.data ? (
						<PokemonSingleForm
							key={singleQuery.data.entityId}
							defaultValues={defaultValues}
							onSubmit={handleSubmit}
							isSubmitting={saveMutation.isPending}
							submitLabel="Save changes"
						/>
					) : (
						<p className="text-sm text-destructive">Card not found.</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
