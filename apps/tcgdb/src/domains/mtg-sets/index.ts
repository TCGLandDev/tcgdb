import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EntityRecord } from "@zengateglobal/persistence-sdk";
import { z } from "zod";

import { getPersistenceClient, type PaginationQuery } from "@/lib/persistence";

export const MTG_SETS_TABLE = "mtg_normalized_set";

export interface MtgSetPayload {
	id: string;
	name: string;
	path: string;
	numberCardsInSet: number;
}

export type MtgSetRecord = EntityRecord<MtgSetPayload>;

export const mtgSetFormSchema = z.object({
	id: z.string().min(1, "Set id is required"),
	name: z.string().min(1, "Name is required"),
	path: z.string().min(1, "Path is required"),
	numberCardsInSet: z.number().int().nonnegative("Card count must be positive"),
});

export type MtgSetFormValues = z.infer<typeof mtgSetFormSchema>;

const mtgSetQueryKeys = {
	all: ["mtgSets"] as const,
	list: (pagination?: PaginationQuery) =>
		[
			"mtgSets",
			"list",
			pagination?.page ?? 1,
			pagination?.pageSize ?? 20,
		] as const,
	detail: (entityId: string) => ["mtgSets", "detail", entityId] as const,
};

const persistence = () => getPersistenceClient();

export function toMtgSetFormValues(record?: MtgSetRecord): MtgSetFormValues {
	if (!record) {
		return {
			id: "",
			name: "",
			path: "",
			numberCardsInSet: 0,
		};
	}
	return {
		id: record.payload.id,
		name: record.payload.name,
		path: record.payload.path,
		numberCardsInSet: record.payload.numberCardsInSet,
	};
}

export function useMtgSetsQuery(pagination?: PaginationQuery) {
	return useQuery({
		queryKey: mtgSetQueryKeys.list(pagination),
		queryFn: async () =>
			persistence().queryEntities<MtgSetPayload>(
				{ tableName: MTG_SETS_TABLE },
				pagination,
			),
	});
}

export function useMtgSetQuery(entityId?: string) {
	return useQuery({
		queryKey: entityId
			? mtgSetQueryKeys.detail(entityId)
			: ["mtgSets", "detail"],
		queryFn: async () => {
			if (!entityId) {
				throw new Error("Entity id is required");
			}
			return persistence().getEntity<MtgSetPayload>({
				tableName: MTG_SETS_TABLE,
				entityId,
			});
		},
		enabled: Boolean(entityId),
	});
}

type SaveArgs = {
	entityId?: string;
	values: MtgSetFormValues;
};

export function useMtgSetSaveMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ entityId, values }: SaveArgs) => {
			return persistence().saveEntity<MtgSetPayload>({
				tableName: MTG_SETS_TABLE,
				entityId,
				payload: values,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mtgSetQueryKeys.all });
		},
	});
}

export function useMtgSetDeleteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (entityId: string) => {
			await persistence().deleteEntity({
				tableName: MTG_SETS_TABLE,
				entityId,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: mtgSetQueryKeys.all });
		},
	});
}
