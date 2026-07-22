import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { clearStoredToken, getStoredToken } from "./auth";

// Captura a URL do arquivo .env de forma segura
const baseURL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
	baseURL,
	timeout: 30000,
	headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Interceptor para injetar o Token
axiosInstance.interceptors.request.use((config) => {
	const token = getStoredToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Não há endpoint de refresh no backend: um 401 significa sessão inválida/expirada,
// então limpamos o token e mandamos o usuário de volta para o login.
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (
			error.response?.status === 401 &&
			window.location.pathname !== "/login"
		) {
			clearStoredToken();
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);

export default async function apiClient<TData>(
	config: AxiosRequestConfig,
): Promise<TData> {
	const response = await axiosInstance.request<TData>(config);
	return response.data;
}
