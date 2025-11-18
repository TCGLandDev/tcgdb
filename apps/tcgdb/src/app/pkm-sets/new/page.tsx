import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
	toPokemonSetFormValues,
	usePokemonSetSaveMutation,
} from "@/domains/pokemon-sets";

export default function PokemonSetsCreatePage() {
	const navigate = useNavigate();
	const saveMutation = usePokemonSetSaveMutation();
	const defaultValues = useMemo(() => toPokemonSetFormValues(), []);

	async function handleSubmit(
		values: ReturnType<typeof toPokemonSetFormValues>,
	) {
		try {
			await saveMutation.mutateAsync({ values });
			toast.success("Set created");
			navigate("/pkm/sets");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create set");
		}
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">New Pokémon Set</h1>
					<p className="text-sm text-muted-foreground">
						Fill out the normalized schema fields to insert a new set record.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/pkm/sets")}>
					Cancel
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Set details</CardTitle>
					<CardDescription>
						All fields map directly to the persistence schema.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PokemonSetForm
						defaultValues={defaultValues}
						onSubmit={handleSubmit}
						isSubmitting={saveMutation.isPending}
						submitLabel="Create set"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
