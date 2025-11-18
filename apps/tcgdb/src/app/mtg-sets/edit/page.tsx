import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	toMtgSetFormValues,
	useMtgSetQuery,
	useMtgSetSaveMutation,
} from "@/domains/mtg-sets";

export default function MtgSetsEditPage() {
	const { entityId } = useParams<{ entityId: string }>();
	const navigate = useNavigate();
	const mtgSetQuery = useMtgSetQuery(entityId);
	const saveMutation = useMtgSetSaveMutation();

	const defaultValues = useMemo(() => {
		if (!mtgSetQuery.data) {
			return toMtgSetFormValues();
		}
		return toMtgSetFormValues(mtgSetQuery.data);
	}, [mtgSetQuery.data]);

	async function handleSubmit(values: ReturnType<typeof toMtgSetFormValues>) {
		if (!entityId) return;
		try {
			await saveMutation.mutateAsync({ entityId, values });
			toast.success("Set updated");
			navigate("/mtg/sets");
		} catch (error) {
			console.error(error);
			toast.error("Failed to update MTG set");
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
					<h1 className="text-2xl font-semibold">Edit MTG Set</h1>
					<p className="text-sm text-muted-foreground">
						Modify the normalized metadata using the persistence SDK.
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate("/mtg/sets")}>
					Back
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Set details</CardTitle>
					<CardDescription>
						Ensure ids stay aligned with downstream consumers.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{mtgSetQuery.isLoading ? (
						<Skeleton className="h-72 w-full" />
					) : mtgSetQuery.data ? (
						<MtgSetForm
							key={mtgSetQuery.data.entityId}
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
