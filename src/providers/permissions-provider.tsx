import { createContext, type ReactNode, use } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import type { Permission } from "@/lib/permissions";

interface PermissionsContextValue {
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (required: Permission[]) => boolean;
	hasAllPermissions: (required: Permission[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
	const { hasPermission, hasAnyPermission, hasAllPermissions } =
		usePermissions();

	return (
		<PermissionsContext
			value={{ hasPermission, hasAnyPermission, hasAllPermissions }}
		>
			{children}
		</PermissionsContext>
	);
}

export function usePermissionsContext(): PermissionsContextValue {
	const context = use(PermissionsContext);
	if (!context) {
		throw new Error(
			"usePermissionsContext deve ser usado dentro de um PermissionsProvider",
		);
	}
	return context;
}

interface PermissionGuardProps {
	children: ReactNode;
	fallback?: ReactNode;
	permission?: Permission;
	permissions?: Permission[];
	requireAll?: boolean;
}

// Esconde/mostra elementos de UI (botões, itens de menu etc.) com base em permissão,
// independente da navegação/rotas (ver route-guards.ts para bloqueio de rotas).
export function PermissionGuard({
	children,
	fallback = null,
	permission,
	permissions,
	requireAll = false,
}: PermissionGuardProps) {
	const { hasPermission, hasAnyPermission, hasAllPermissions } =
		usePermissionsContext();

	let allowed = true;
	if (permission) {
		allowed = hasPermission(permission);
	} else if (permissions?.length) {
		allowed = requireAll
			? hasAllPermissions(permissions)
			: hasAnyPermission(permissions);
	}

	return allowed ? children : fallback;
}
