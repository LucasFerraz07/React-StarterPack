import { usePermissionStore } from "@/stores/permission-store";

// Wrapper fino sobre o permission-store, para componentes não precisarem importar o store diretamente.
export function usePermissions() {
	const roles = usePermissionStore((state) => state.roles);
	const permissions = usePermissionStore((state) => state.permissions);
	const hasPermission = usePermissionStore((state) => state.hasPermission);
	const hasAnyPermission = usePermissionStore(
		(state) => state.hasAnyPermission,
	);
	const hasAllPermissions = usePermissionStore(
		(state) => state.hasAllPermissions,
	);
	const getModulePermissions = usePermissionStore(
		(state) => state.getModulePermissions,
	);

	return {
		roles,
		permissions,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		getModulePermissions,
	};
}
