import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/app/admin-layout";
import DashboardPage from "@/app/dashboard/page";
import MtgSetsEditPage from "@/app/mtg-sets/edit/page";
import MtgSetsCreatePage from "@/app/mtg-sets/new/page";
import MtgSetsPage from "@/app/mtg-sets/page";
import NotFoundPage from "@/app/not-found";
import PokemonSetsEditPage from "@/app/pkm-sets/edit/page";
import PokemonSetsCreatePage from "@/app/pkm-sets/new/page";
import PokemonSetsPage from "@/app/pkm-sets/page";
import PokemonSinglesEditPage from "@/app/pkm-singles/edit/page";
import PokemonSinglesCreatePage from "@/app/pkm-singles/new/page";
import PokemonSinglesPage from "@/app/pkm-singles/page";

// Router skeleton for the admin app.
// NOTE: Add new domain routes here as they become available.
export function AdminRoutes() {
	return (
		<Routes>
			<Route element={<AdminLayout />}>
				<Route index element={<DashboardPage />} />
				<Route path="/pkm/sets" element={<PokemonSetsPage />} />
				<Route path="/pkm/sets/new" element={<PokemonSetsCreatePage />} />
				<Route
					path="/pkm/sets/:entityId/edit"
					element={<PokemonSetsEditPage />}
				/>
				<Route path="/pkm/singles" element={<PokemonSinglesPage />} />
				<Route path="/pkm/singles/new" element={<PokemonSinglesCreatePage />} />
				<Route
					path="/pkm/singles/:entityId/edit"
					element={<PokemonSinglesEditPage />}
				/>
				<Route path="/mtg/sets" element={<MtgSetsPage />} />
				<Route path="/mtg/sets/new" element={<MtgSetsCreatePage />} />
				<Route path="/mtg/sets/:entityId/edit" element={<MtgSetsEditPage />} />
				{/* Not Found */}
				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
}
