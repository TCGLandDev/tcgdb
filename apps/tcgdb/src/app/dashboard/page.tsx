import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useMtgSetsQuery } from "@/domains/mtg-sets";
import { usePokemonSetsQuery } from "@/domains/pokemon-sets";
import { usePokemonSinglesQuery } from "@/domains/pokemon-singles";

export default function Page() {
	const navigate = useNavigate();
	const pokemonSetsStats = usePokemonSetsQuery({ page: 1, pageSize: 1 });
	const pokemonSinglesStats = usePokemonSinglesQuery({ page: 1, pageSize: 1 });
	const mtgSetsStats = useMtgSetsQuery({ page: 1, pageSize: 1 });

	const tiles = [
		{
			title: "Pokémon Sets",
			description: "Normalized records from pkm_normalized_set.schema.json",
			total: pokemonSetsStats.data?.totalItems ?? 0,
			actionLabel: "Manage sets",
			onClick: () => navigate("/pkm/sets"),
		},
		{
			title: "Pokémon Singles",
			description: "Card inventory driven by pkm_normalized_card.schema.json",
			total: pokemonSinglesStats.data?.totalItems ?? 0,
			actionLabel: "Manage singles",
			onClick: () => navigate("/pkm/singles"),
		},
		{
			title: "MTG Sets",
			description: "Normalized MTG set schema entries",
			total: mtgSetsStats.data?.totalItems ?? 0,
			actionLabel: "Manage MTG sets",
			onClick: () => navigate("/mtg/sets"),
		},
	];

	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold">TCG Database</h1>
				<p className="text-sm text-muted-foreground">
					User-facing CRUD shell powered by @zengateglobal/persistence-sdk and
					the shared schemas.
				</p>
			</div>
			<div className="grid gap-4 md:grid-cols-3">
				{tiles.map((tile) => (
					<Card key={tile.title}>
						<CardHeader>
							<CardTitle>{tile.title}</CardTitle>
							<CardDescription>{tile.description}</CardDescription>
						</CardHeader>
						<CardContent className="flex items-center justify-between">
							<div>
								<p className="text-3xl font-semibold">{tile.total}</p>
								<p className="text-sm text-muted-foreground">Total records</p>
							</div>
							<Button onClick={tile.onClick}>{tile.actionLabel}</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
