import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";
import "@/stores/color-theme-store";

// 1. Instancia o cliente do TanStack Query (Gerenciador de Cache)
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false, // Evita requisições ao mudar de aba
			retry: 1,
		},
	},
});

// 2. Importa a árvore de rotas gerada pelo TanStack Router
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
					<Toaster />
				</QueryClientProvider>
			</ThemeProvider>
		</StrictMode>,
	);
}
