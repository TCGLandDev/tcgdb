import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import {
	toPokemonSingleFormValues,
	usePokemonSingleSaveMutation,
} from "@/domains/pokemon-singles";

export default function PokemonSinglesCreatePage() {
	const navigate = useNavigate();
	const saveMutation = usePokemonSingleSaveMutation();
	const defaultValues = useMemo(() => toPokemonSingleFormValues(), []);

	async function handleSubmit(
		values: ReturnType<typeof toPokemonSingleFormValues>,
	) {
		try {
			await saveMutation.mutateAsync({ values });
			toast.success("Card created");
			navigate("/pkm/singles");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create card");
		}
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">New Pokémon Card</h1>
					<p className="text-sm text-muted-foreground">
						Populate the normalized single schema fields.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/pkm/singles")}>
					Cancel
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Card details</CardTitle>
					<CardDescription>
						All inputs map to the `/products/pkm_normalized_card` schema.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<PokemonSingleForm
						defaultValues={defaultValues}
						onSubmit={handleSubmit}
						isSubmitting={saveMutation.isPending}
						submitLabel="Create card"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
