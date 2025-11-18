import {
	IconDashboard,
	IconDatabase,
	IconHelp,
	IconInnerShadowTop,
	IconPokeball,
	IconSearch,
	IconSettings,
} from "@tabler/icons-react";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{ title: "Dashboard", url: "/", icon: IconDashboard, exact: true },
		{ title: "Pokémon Sets", url: "/pkm/sets", icon: IconPokeball },
		{ title: "Pokémon Singles", url: "/pkm/singles", icon: IconPokeball },
		{ title: "MTG Sets", url: "/mtg/sets", icon: IconDatabase },
	],
	navData: [
		{
			title: "Pokémon Schemas",
			icon: IconDatabase,
			children: [
				{ title: "pkm_normalized_set", url: "/pkm/sets" },
				{ title: "pkm_normalized_card", url: "/pkm/singles" },
			],
		},
		{
			title: "Magic Schemas",
			icon: IconDatabase,
			children: [{ title: "mtg_normalized_set", url: "/mtg/sets" }],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "#",
			icon: IconSettings,
		},
		{
			title: "Get Help",
			url: "#",
			icon: IconHelp,
		},
		{
			title: "Search",
			url: "#",
			icon: IconSearch,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className="data-[slot=sidebar-menu-button]:!p-1.5"
						>
							<a href="/">
								<IconInnerShadowTop className="!size-5" />
								<span className="text-base font-semibold">TCG DB</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
				<SidebarGroup className="group-data-[collapsible=icon]:hidden space-y-3">
					<SidebarGroupLabel>Data</SidebarGroupLabel>
					{data.navData.map((group) => (
						<div key={group.title} className="space-y-1">
							<div className="flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/70">
								<group.icon className="size-3.5" />
								<span>{group.title}</span>
							</div>
							<SidebarMenu className="ml-4">
								{group.children.map((child) => (
									<SidebarMenuItem key={`${group.title}-${child.title}`}>
										<SidebarMenuButton asChild size="sm">
											<a href={child.url}>
												<span>{child.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</div>
					))}
				</SidebarGroup>
				<NavSecondary items={data.navSecondary} className="mt-auto" />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={data.user} />
			</SidebarFooter>
		</Sidebar>
	);
}
