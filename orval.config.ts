import { defineConfig } from "orval";
import { loadEnv } from "vite";

// Carrega as variáveis do arquivo .env baseado no modo de execução
const env = loadEnv(process.env.MODE ?? "development", process.cwd(), "");
const API_SWAGGER_URL = env.VITE_API_SWAGGER_URL ?? "";

export default defineConfig({
	api: {
		input: { target: API_SWAGGER_URL }, // Orval vai ler direto do ApiDog!
		output: {
			mode: "tags-split", // Cria 1 arquivo por entidade do Swagger
			target: "./src/api/generated",
			schemas: "./src/api/generated/models",
			client: "react-query", // Gera os hooks de useQuery/useMutation
			httpClient: "axios", // Sem isso o Orval assume fetch() e quebra o mutator Axios
			tsconfig: "./tsconfig.app.json",
			//clean: true,
			override: {
				mutator: {
					path: "./src/lib/api-client.ts", // Aponta para o nosso cliente Axios
					name: "apiClient",
					default: true,
				},
				query: {
					useInfinite: false,
					useInfiniteQueryParam: "page",
				},
			},
		},
	},
});
