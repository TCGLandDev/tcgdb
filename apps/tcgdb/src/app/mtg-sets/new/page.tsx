import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MtgSetForm } from "@/app/mtg-sets/mtg-set-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toMtgSetFormValues, useMtgSetSaveMutation } from "@/domains/mtg-sets";

export default function MtgSetsCreatePage() {
	const navigate = useNavigate();
	const saveMutation = useMtgSetSaveMutation();
	const defaultValues = useMemo(() => toMtgSetFormValues(), []);

	async function handleSubmit(values: ReturnType<typeof toMtgSetFormValues>) {
		try {
			await saveMutation.mutateAsync({ values });
			toast.success("Set created");
			navigate("/mtg/sets");
		} catch (error) {
			console.error(error);
			toast.error("Failed to create MTG set");
		}
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">New MTG Set</h1>
					<p className="text-sm text-muted-foreground">
						Provide the core metadata for the MTG normalized set schema.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/mtg/sets")}>
					Cancel
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Set details</CardTitle>
					<CardDescription>
						Every field maps to the persistence schema.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MtgSetForm
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
