import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { ensureAuthenticated } from "@/utils/route-guards";

export const Route = createFileRoute("/(protected)/_layout")({
	// ESSA É A MÁGICA: O TanStack Router roda o guardião antes de abrir a tela
	beforeLoad: async () => {
		await ensureAuthenticated();
	},
	component: ProtectedLayout,
});

function ProtectedLayout() {
	return (
		<PermissionsProvider>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<SidebarTrigger className="m-4 mb-0" />
					<main className="m-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-border bg-muted p-16">
						<Outlet />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</PermissionsProvider>
	);
}
