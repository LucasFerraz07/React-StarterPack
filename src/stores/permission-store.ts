import { create } from "zustand";
import {
	checkPermission,
	getModulePermissions,
	hasAllPermissions,
	hasAnyPermission,
	type Permission,
	type Role,
} from "@/lib/permissions";

interface PermissionState {
	roles: Role[];
	permissions: Set<Permission>;
	permissionMap: Map<string, Set<Permission>>;
}

interface PermissionActions {
	setPermissions: (permissions: Permission[], roles: Role[]) => void;
	clearPermissions: () => void;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (required: Permission[]) => boolean;
	hasAllPermissions: (required: Permission[]) => boolean;
	getModulePermissions: (module: string) => Set<Permission>;
}

// Agrupa as permissões (formato "modulo.acao") por módulo, para consultas rápidas.
function buildPermissionMap(
	permissions: Set<Permission>,
): Map<string, Set<Permission>> {
	const map = new Map<string, Set<Permission>>();
	for (const permission of permissions) {
		const [module] = permission.split(".");
		if (!map.has(module)) {
			map.set(module, new Set());
		}
		map.get(module)?.add(permission);
	}
	return map;
}

export const usePermissionStore = create<PermissionState & PermissionActions>(
	(set, get) => ({
		roles: [],
		permissions: new Set(),
		permissionMap: new Map(),

		setPermissions: (permissions, roles) => {
			const permissionSet = new Set(permissions);
			set({
				roles,
				permissions: permissionSet,
				permissionMap: buildPermissionMap(permissionSet),
			});
		},

		clearPermissions: () => {
			set({ roles: [], permissions: new Set(), permissionMap: new Map() });
		},

		hasPermission: (permission) =>
			checkPermission(get().permissions, permission),

		hasAnyPermission: (required) =>
			hasAnyPermission(required, get().permissions),

		hasAllPermissions: (required) =>
			hasAllPermissions(required, get().permissions),

		getModulePermissions: (module) =>
			getModulePermissions(get().permissions, module),
	}),
);
