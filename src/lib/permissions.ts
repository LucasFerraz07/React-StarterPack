import type { UserResourceRoles } from "@/api/generated/models";

// Permissões e roles vêm do backend como strings livres (ex.: "roles.view", "roles.edit"),
// no formato "modulo.acao". Não há enum fixo no frontend.
export type Permission = string;
export type Role = string;

// `roles` vem da API como um mapa { [nomeDoPapel]: metadados }; o usuário possui o
// papel quando a chave está presente com um valor "truthy".
export function extractRoles(roles: UserResourceRoles): Role[] {
	return Object.entries(roles)
		.filter(([, value]) => Boolean(value))
		.map(([role]) => role);
}

export function checkPermission(
	permissions: Set<Permission>,
	permission: Permission,
): boolean {
	return permissions.has(permission);
}

export function hasAnyPermission(
	required: Permission[],
	userPermissions: Set<Permission>,
): boolean {
	return required.some((permission) => userPermissions.has(permission));
}

export function hasAllPermissions(
	required: Permission[],
	userPermissions: Set<Permission>,
): boolean {
	return required.every((permission) => userPermissions.has(permission));
}

export function getModulePermissions(
	permissions: Set<Permission>,
	module: string,
): Set<Permission> {
	const prefix = `${module}.`;
	return new Set(
		[...permissions].filter((permission) => permission.startsWith(prefix)),
	);
}
