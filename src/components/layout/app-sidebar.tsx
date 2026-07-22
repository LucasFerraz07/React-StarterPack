import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import {
	type NavItem,
	type NavSubItem,
	navItems,
} from "@/components/layout/nav-items";
import { NavUser } from "@/components/layout/nav-user";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";

export function AppSidebar() {
	const { pathname } = useLocation();
	const { hasPermission, hasAnyPermission, hasAllPermissions } =
		usePermissions();

	function canSeeItem(item: NavItem | NavSubItem): boolean {
		if (item.hideIfPermission) {
			const excluded = Array.isArray(item.hideIfPermission)
				? item.hideIfPermission
				: [item.hideIfPermission];

			if (hasAnyPermission(excluded)) return false;
		}

		if (!item.permission) return true;

		const required = Array.isArray(item.permission)
			? item.permission
			: [item.permission];

		if (required.length === 1) return hasPermission(required[0]);

		return item.requireAll
			? hasAllPermissions(required)
			: hasAnyPermission(required);
	}

	const visibleNavItems = navItems
		.filter(canSeeItem)
		.map((item) => ({
			...item,
			items: item.items?.filter(canSeeItem),
		}))
		.filter((item) => item.to !== undefined || (item.items?.length ?? 0) > 0);

	return (
		<Sidebar className="" collapsible="icon">
			<SidebarHeader>
				<span className="p-4 text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
					Master Liga
				</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{visibleNavItems.map((item) => {
								if (!item.items?.length) {
									return (
										<SidebarMenuItem key={item.title}>
											<SidebarMenuButton
												asChild
												isActive={pathname === item.to}
												tooltip={item.title}
											>
												<Link to={item.to} activeOptions={{ exact: true }}>
													<item.icon />
													<span>{item.title}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								}

								const isGroupActive = item.items.some(
									(subItem) => pathname === subItem.to,
								);

								return (
									<Collapsible
										key={item.title}
										asChild
										defaultOpen={isGroupActive}
										className="group/collapsible"
									>
										<SidebarMenuItem>
											<CollapsibleTrigger asChild>
												<SidebarMenuButton
													isActive={isGroupActive}
													tooltip={item.title}
												>
													<item.icon />
													<span>{item.title}</span>
													<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
												</SidebarMenuButton>
											</CollapsibleTrigger>
											<CollapsibleContent>
												<SidebarMenuSub>
													{item.items.map((subItem) => (
														<SidebarMenuSubItem key={subItem.to}>
															<SidebarMenuSubButton
																asChild
																isActive={pathname === subItem.to}
															>
																<Link
																	to={subItem.to}
																	activeOptions={{ exact: true }}
																>
																	<span>{subItem.title}</span>
																</Link>
															</SidebarMenuSubButton>
														</SidebarMenuSubItem>
													))}
												</SidebarMenuSub>
											</CollapsibleContent>
										</SidebarMenuItem>
									</Collapsible>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
