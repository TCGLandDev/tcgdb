import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EntityRecord } from "@zengateglobal/persistence-sdk";
import { z } from "zod";

import { getPersistenceClient, type PaginationQuery } from "@/lib/persistence";

export const POKEMON_SETS_TABLE = "pkm_sets";

export interface PokemonSetPayload {
	id: string;
	name: string;
	path: string;
	series: string;
	printedTotal: number;
	legalities: string[];
	releaseDate: string;
	imgSymbol: string;
	imgLogo: string;
}

export type PokemonSetRecord = EntityRecord<PokemonSetPayload>;

export const pokemonSetFormSchema = z.object({
	id: z.string().min(1, "Set id is required"),
	name: z.string().min(1, "Name is required"),
	path: z.string().min(1, "Path is required"),
	series: z.string().min(1, "Series is required"),
	printedTotal: z.number().int().nonnegative("Printed total must be 0 or more"),
	legalities: z.array(z.string().min(1)).min(1, "Add at least one legality"),
	releaseDate: z.string().min(1, "Release date is required"),
	imgSymbol: z.string().min(1, "Symbol image is required"),
	imgLogo: z.string().min(1, "Logo image is required"),
});

export type PokemonSetFormValues = z.infer<typeof pokemonSetFormSchema>;

export const pokemonSetQueryKeys = {
	all: ["pokemonSets"] as const,
	list: (pagination?: PaginationQuery) =>
		[
			"pokemonSets",
			"list",
			pagination?.page ?? 1,
			pagination?.pageSize ?? 20,
		] as const,
	detail: (entityId: string) => ["pokemonSets", "detail", entityId] as const,
};

const persistence = () => getPersistenceClient();

export function toPokemonSetFormValues(
	record?: PokemonSetRecord,
): PokemonSetFormValues {
	if (!record) {
		return {
			id: "",
			name: "",
			path: "",
			series: "",
			printedTotal: 0,
			legalities: [],
			releaseDate: "",
			imgSymbol: "",
			imgLogo: "",
		};
	}

	return {
		id: record.payload.id,
		name: record.payload.name,
		path: record.payload.path,
		series: record.payload.series,
		printedTotal: record.payload.printedTotal,
		legalities: record.payload.legalities ?? [],
		releaseDate: toDateInput(record.payload.releaseDate),
		imgSymbol: record.payload.imgSymbol,
		imgLogo: record.payload.imgLogo,
	};
}

export function toPokemonSetPayload(
	values: PokemonSetFormValues,
): PokemonSetPayload {
	return {
		...values,
		legalities: values.legalities.map((entry) => entry.trim()).filter(Boolean),
		releaseDate: toIsoDate(values.releaseDate),
	};
}

export function usePokemonSetsQuery(pagination?: PaginationQuery) {
	return useQuery({
		queryKey: pokemonSetQueryKeys.list(pagination),
		queryFn: async () =>
			persistence().queryEntities<PokemonSetPayload>(
				{ tableName: POKEMON_SETS_TABLE },
				pagination,
			),
	});
}

export function usePokemonSetQuery(entityId?: string) {
	return useQuery({
		queryKey: entityId
			? pokemonSetQueryKeys.detail(entityId)
			: ["pokemonSets", "detail"],
		queryFn: async () => {
			if (!entityId) {
				throw new Error("Entity id is required");
			}
			return persistence().getEntity<PokemonSetPayload>({
				tableName: POKEMON_SETS_TABLE,
				entityId,
			});
		},
		enabled: Boolean(entityId),
	});
}

type SavePokemonSetArgs = {
	entityId?: string;
	values: PokemonSetFormValues;
};

export function usePokemonSetSaveMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ entityId, values }: SavePokemonSetArgs) => {
			const payload = toPokemonSetPayload(values);
			return persistence().saveEntity<PokemonSetPayload>({
				tableName: POKEMON_SETS_TABLE,
				entityId,
				payload,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pokemonSetQueryKeys.all });
		},
	});
}

export function usePokemonSetDeleteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (entityId: string) => {
			await persistence().deleteEntity({
				tableName: POKEMON_SETS_TABLE,
				entityId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pokemonSetQueryKeys.all });
		},
	});
}

function toDateInput(value: string | undefined) {
	if (!value) {
		return "";
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error("Invalid date value");
	}
	return date.toISOString();
}
