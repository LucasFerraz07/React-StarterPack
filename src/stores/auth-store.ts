import { create } from "zustand";
import { loginAuth, logoutAuth, meAuth } from "@/api/generated/auth/auth";
import type { UserResource } from "@/api/generated/models";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/auth";
import { extractRoles, type Permission } from "@/lib/permissions";
import { usePermissionStore } from "@/stores/permission-store";

// O schema `AuthResource` do OpenAPI vem quebrado do backend (gera `unknown[]`),
// então tipamos manualmente o retorno real de POST /auth/login aqui.
interface LoginResponseData {
	user: UserResource;
	token: string;
	refresh_expires_in: number;
}

interface AuthState {
	user: UserResource | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AuthActions {
	signIn: (
		email: string,
		password: string,
		rememberMe?: boolean,
	) => Promise<void>;
	signOut: () => Promise<void>;
	initialize: () => Promise<void>;
}

// O auth-store não guarda permissions/roles diretamente — isso é responsabilidade
// exclusiva do permission-store, mantido em sincronia aqui a cada login/hidratação.
function syncPermissions(user: UserResource): void {
	usePermissionStore
		.getState()
		.setPermissions(user.permissions as Permission[], extractRoles(user.roles));
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,

	signIn: async (email, password, rememberMe = true) => {
		const response = await loginAuth({ email, password });
		const data = response.data as unknown as LoginResponseData;
		setStoredToken(data.token, { remember: rememberMe });
		syncPermissions(data.user);
		set({ user: data.user, isAuthenticated: true, isLoading: false });
	},

	signOut: async () => {
		try {
			await logoutAuth();
		} finally {
			clearStoredToken();
			usePermissionStore.getState().clearPermissions();
			set({ user: null, isAuthenticated: false, isLoading: false });
		}
	},

	// Chamado uma vez no mount do app (via beforeLoad das rotas protegidas):
	// valida o token salvo carregando o usuário atual.
	initialize: async () => {
		const token = getStoredToken();
		if (!token) {
			set({ user: null, isAuthenticated: false, isLoading: false });
			return;
		}

		try {
			const response = await meAuth();
			syncPermissions(response.data);
			set({ user: response.data, isAuthenticated: true, isLoading: false });
		} catch {
			clearStoredToken();
			usePermissionStore.getState().clearPermissions();
			set({ user: null, isAuthenticated: false, isLoading: false });
		}
	},
}));
