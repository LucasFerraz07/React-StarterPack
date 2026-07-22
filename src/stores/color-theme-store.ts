import { create } from "zustand";
import {
	applyColorTheme,
	type ColorTheme,
	getStoredColorTheme,
} from "@/lib/color-theme";

interface ColorThemeState {
	colorTheme: ColorTheme;
	setColorTheme: (theme: ColorTheme) => void;
}

const initialColorTheme = getStoredColorTheme();
applyColorTheme(initialColorTheme);

export const useColorThemeStore = create<ColorThemeState>((set) => ({
	colorTheme: initialColorTheme,
	setColorTheme: (theme) => {
		applyColorTheme(theme);
		set({ colorTheme: theme });
	},
}));
