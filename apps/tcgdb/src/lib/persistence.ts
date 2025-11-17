import {
	createOnlineOpenAPIPersistenceProvider,
	type PaginationQuery,
	PersistenceClient,
} from "@zengateglobal/persistence-sdk";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const tokenSupplier = () => {
	if (typeof window === "undefined") {
		return undefined;
	}
	return sessionStorage.getItem("jwt") ?? undefined;
};

const persistenceClient = new PersistenceClient([
	createOnlineOpenAPIPersistenceProvider({
		baseUrl: BASE_URL,
		getToken: tokenSupplier,
	}),
]);

export function getPersistenceClient() {
	return persistenceClient;
}

export type { PaginationQuery };
