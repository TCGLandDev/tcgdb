import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EntityRecord } from "@zengateglobal/persistence-sdk";
import { z } from "zod";

import { getPersistenceClient, type PaginationQuery } from "@/lib/persistence";

export const POKEMON_SINGLES_TABLE = "pkm_cards";

export interface PokemonSinglePayload {
	tcgLandPublicId: string;
	oracleId: string;
	sId: string;
	cId: string;
	lang: string;
	path: string;
	name: string;
	number: string;
	supertype: string;
	rarity?: string;
	subtypes?: string[];
	types?: string[];
	tcgPlayerIds: number[];
	images: {
		small: string;
		large: string;
	};
	legalities: Record<string, string>;
}

export type PokemonSingleRecord = EntityRecord<PokemonSinglePayload>;

export const pokemonSingleFormSchema = z.object({
	tcgLandPublicId: z.string().min(1, "Public id is required"),
	oracleId: z.string().min(1, "Oracle id is required"),
	sId: z.string().min(1, "Set id is required"),
	cId: z.string().min(1, "Card id is required"),
	lang: z.string().min(1, "Language is required"),
	path: z.string().min(1, "Path is required"),
	name: z.string().min(1, "Name is required"),
	number: z.string().min(1, "Collector number is required"),
	supertype: z.string().min(1, "Supertype is required"),
	rarity: z.string().optional(),
	types: z.array(z.string().min(1)),
	subtypes: z.array(z.string().min(1)),
	tcgPlayerIds: z
		.array(z.number().int().nonnegative("Use non-negative ids"))
		.min(1),
	images: z.object({
		small: z.string().min(1, "Small image is required"),
		large: z.string().min(1, "Large image is required"),
	}),
	legalities: z
		.array(
			z.object({
				format: z.string().min(1, "Format is required"),
				status: z.string().min(1, "Status is required"),
			}),
		)
		.min(1, "Add at least one legality"),
});

export type PokemonSingleFormValues = z.infer<typeof pokemonSingleFormSchema>;

const pokemonSingleQueryKeys = {
	all: ["pokemonSingles"] as const,
	list: (pagination?: PaginationQuery) =>
		[
			"pokemonSingles",
			"list",
			pagination?.page ?? 1,
			pagination?.pageSize ?? 20,
		] as const,
	detail: (entityId: string) => ["pokemonSingles", "detail", entityId] as const,
};

const persistence = () => getPersistenceClient();

export function toPokemonSingleFormValues(
	record?: PokemonSingleRecord,
): PokemonSingleFormValues {
	if (!record) {
		return {
			tcgLandPublicId: "",
			oracleId: "",
			sId: "",
			cId: "",
			lang: "",
			path: "",
			name: "",
			number: "",
			supertype: "",
			rarity: "",
			types: [],
			subtypes: [],
			tcgPlayerIds: [0],
			images: { small: "", large: "" },
			legalities: [{ format: "", status: "" }],
		};
	}
	const { payload } = record;
	const legalitiesEntries = Object.entries(payload.legalities ?? {}).map(
		([format, status]) => ({
			format,
			status,
		}),
	);
	return {
		tcgLandPublicId: payload.tcgLandPublicId,
		oracleId: payload.oracleId,
		sId: payload.sId,
		cId: payload.cId,
		lang: payload.lang,
		path: payload.path,
		name: payload.name,
		number: payload.number,
		supertype: payload.supertype,
		rarity: payload.rarity ?? "",
		types: payload.types ?? [],
		subtypes: payload.subtypes ?? [],
		tcgPlayerIds:
			payload.tcgPlayerIds && payload.tcgPlayerIds.length > 0
				? payload.tcgPlayerIds
				: [0],
		images: payload.images,
		legalities: legalitiesEntries.length
			? legalitiesEntries
			: [{ format: "", status: "" }],
	};
}

export function toPokemonSinglePayload(
	values: PokemonSingleFormValues,
): PokemonSinglePayload {
	const legalities: Record<string, string> = {};
	for (const entry of values.legalities) {
		if (entry.format && entry.status) {
			legalities[entry.format] = entry.status;
		}
	}
	return {
		tcgLandPublicId: values.tcgLandPublicId,
		oracleId: values.oracleId,
		sId: values.sId,
		cId: values.cId,
		lang: values.lang,
		path: values.path,
		name: values.name,
		number: values.number,
		supertype: values.supertype,
		rarity: values.rarity || undefined,
		types: values.types.length ? values.types : undefined,
		subtypes: values.subtypes.length ? values.subtypes : undefined,
		tcgPlayerIds: values.tcgPlayerIds,
		images: values.images,
		legalities,
	};
}

export function usePokemonSinglesQuery(pagination?: PaginationQuery) {
	return useQuery({
		queryKey: pokemonSingleQueryKeys.list(pagination),
		queryFn: async () =>
			persistence().queryEntities<PokemonSinglePayload>(
				{ tableName: POKEMON_SINGLES_TABLE },
				pagination,
			),
	});
}

export function usePokemonSingleQuery(entityId?: string) {
	return useQuery({
		queryKey: entityId
			? pokemonSingleQueryKeys.detail(entityId)
			: ["pokemonSingles", "detail"],
		queryFn: async () => {
			if (!entityId) {
				throw new Error("Entity id is required");
			}
			return persistence().getEntity<PokemonSinglePayload>({
				tableName: POKEMON_SINGLES_TABLE,
				entityId,
			});
		},
		enabled: Boolean(entityId),
	});
}

type SaveArgs = {
	entityId?: string;
	values: PokemonSingleFormValues;
};

export function usePokemonSingleSaveMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ entityId, values }: SaveArgs) => {
			return persistence().saveEntity<PokemonSinglePayload>({
				tableName: POKEMON_SINGLES_TABLE,
				entityId,
				payload: toPokemonSinglePayload(values),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pokemonSingleQueryKeys.all });
		},
	});
}

export function usePokemonSingleDeleteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (entityId: string) => {
			await persistence().deleteEntity({
				tableName: POKEMON_SINGLES_TABLE,
				entityId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: pokemonSingleQueryKeys.all });
		},
	});
}
