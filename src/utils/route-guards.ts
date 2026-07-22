import { redirect } from "@tanstack/react-router";
import type { Permission } from "@/lib/permissions";
import { useAuthStore } from "../stores/auth-store";
import { usePermissionStore } from "../stores/permission-store";
import { routes } from "./routes";

export interface RoutePermissionsStaticData {
	requiredPermission?: Permission;
	requiredPermissions?: Permission[];
	requireAll?: boolean;
	deniedPermissions?: Permission[];
}

async function ensureInitialized(): Promise<void> {
	if (useAuthStore.getState().isLoading) {
		await useAuthStore.getState().initialize();
	}
}

// Roda antes de qualquer rota protegida: valida o token salvo e redireciona para o login se necessário
export async function ensureAuthenticated(): Promise<void> {
	await ensureInitialized();

	if (!useAuthStore.getState().isAuthenticated) {
		throw redirect({ to: routes.auth.login });
	}
}

// Roda antes da tela de login: se o usuário já estiver autenticado, manda direto para o dashboard
export async function ensureGuest(): Promise<void> {
	await ensureInitialized();

	if (useAuthStore.getState().isAuthenticated) {
		throw redirect({ to: routes.app.home });
	}
}

// Roda depois de ensureAuthenticated(), em rotas que exigem permissões específicas.
// Síncrona: lê o permission-store, já populado pelo auth-store durante o login/initialize.
export function ensureRoutePermissions(
	staticData: RoutePermissionsStaticData | undefined,
): void {
	if (!staticData) return;

	const {
		requiredPermission,
		requiredPermissions,
		requireAll = false,
		deniedPermissions,
	} = staticData;

	const permissionStore = usePermissionStore.getState();

	if (
		deniedPermissions?.length &&
		permissionStore.hasAnyPermission(deniedPermissions)
	) {
		throw redirect({ to: routes.app.home });
	}

	if (requiredPermission) {
		if (!permissionStore.hasPermission(requiredPermission)) {
			throw redirect({ to: routes.app.home });
		}
		return;
	}

	if (requiredPermissions?.length) {
		const allowed = requireAll
			? permissionStore.hasAllPermissions(requiredPermissions)
			: permissionStore.hasAnyPermission(requiredPermissions);
		if (!allowed) {
			throw redirect({ to: routes.app.home });
		}
	}
}
