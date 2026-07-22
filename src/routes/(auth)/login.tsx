import { createFileRoute } from "@tanstack/react-router";
import { AuthLoginForm } from "@/components/auth/auth-login-form";
import { ensureGuest } from "@/utils/route-guards";

export const Route = createFileRoute("/(auth)/login")({
	beforeLoad: async () => {
		await ensureGuest();
	},
	component: LoginPage,
});

function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center bg-slate-900">
			<AuthLoginForm />
		</div>
	);
}
