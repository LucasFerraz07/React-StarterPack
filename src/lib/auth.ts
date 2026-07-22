const TOKEN_KEY = "auth_token";

// Remember Me = localStorage (sobrevive ao fechar o navegador); sessão only = sessionStorage
export function setStoredToken(
	token: string,
	options?: { remember?: boolean },
): void {
	const remember = options?.remember ?? true;
	clearStoredToken();
	if (remember) {
		localStorage.setItem(TOKEN_KEY, token);
	} else {
		sessionStorage.setItem(TOKEN_KEY, token);
	}
}

// Tenta sessionStorage primeiro, depois localStorage
export function getStoredToken(): string | null {
	return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
}

export function clearStoredToken(): void {
	localStorage.removeItem(TOKEN_KEY);
	sessionStorage.removeItem(TOKEN_KEY);
}
