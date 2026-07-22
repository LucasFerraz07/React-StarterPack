const STORAGE_KEY = "color-theme";

export const COLOR_THEMES = [
	{ value: "default", label: "Padrão" },
	{ value: "tangerine", label: "Tangerine" },
	{ value: "libertadores", label: "Libertadores" },
	{ value: "champions", label: "Champions League" },
] as const;

export type ColorTheme = (typeof COLOR_THEMES)[number]["value"];

function isColorTheme(value: string | null): value is ColorTheme {
	return COLOR_THEMES.some((theme) => theme.value === value);
}

export function getStoredColorTheme(): ColorTheme {
	const stored = localStorage.getItem(STORAGE_KEY);
	return isColorTheme(stored) ? stored : "default";
}

// Classe fica em <html> ao lado de "dark" (next-themes), então o CSS
// combina os dois em seletores como .dark.theme-blue.
export function applyColorTheme(theme: ColorTheme): void {
	const root = document.documentElement;
	for (const { value } of COLOR_THEMES) {
		root.classList.remove(`theme-${value}`);
	}
	if (theme !== "default") {
		root.classList.add(`theme-${theme}`);
	}
	localStorage.setItem(STORAGE_KEY, theme);
}
