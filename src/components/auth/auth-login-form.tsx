import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { type LoginSchema, loginSchema } from "@/schemas/login-schema";
import { useAuthStore } from "@/stores/auth-store";
import { routes } from "@/utils/routes";

export function AuthLoginForm() {
	const signIn = useAuthStore((state) => state.signIn);
	const navigate = useNavigate();

	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
			rememberMe: true,
		},
	});

	const onSubmit = async (data: LoginSchema) => {
		setServerError(null);
		try {
			await signIn(data.email, data.password, data.rememberMe);
			navigate({ to: routes.app.home });
		} catch (error) {
			const message = isAxiosError<{ message?: string }>(error)
				? (error.response?.data?.message ?? "Credenciais inválidas.")
				: "Ocorreu um erro inesperado.";
			setServerError(message);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full max-w-sm rounded-xl bg-slate-800 p-8 shadow-xl border border-slate-700"
			noValidate
		>
			<h2 className="mb-6 text-center text-2xl font-bold text-white">
				Acessar Master Liga
			</h2>

			<FieldGroup>
				<Field data-invalid={!!errors.email}>
					<FieldLabel htmlFor="email">Email</FieldLabel>
					<Input
						id="email"
						type="email"
						autoComplete="email"
						aria-invalid={!!errors.email}
						{...register("email")}
					/>
					<FieldError errors={[errors.email]} />
				</Field>

				<Field data-invalid={!!errors.password}>
					<FieldLabel htmlFor="password">Senha</FieldLabel>
					<InputGroup>
						<InputGroupInput
							id="password"
							type={showPassword ? "text" : "password"}
							autoComplete="current-password"
							aria-invalid={!!errors.password}
							{...register("password")}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupButton
								type="button"
								size="icon-xs"
								aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
								onClick={() => setShowPassword((prev) => !prev)}
							>
								{showPassword ? <EyeOff /> : <Eye />}
							</InputGroupButton>
						</InputGroupAddon>
					</InputGroup>
					<FieldError errors={[errors.password]} />
				</Field>

				<Field orientation="horizontal">
					<Input
						id="rememberMe"
						type="checkbox"
						className="h-4 w-4 shrink-0"
						{...register("rememberMe")}
					/>
					<FieldLabel htmlFor="rememberMe" className="font-normal">
						Lembrar de mim
					</FieldLabel>
				</Field>

				{serverError && (
					<FieldError>
						<p className="text-center">{serverError}</p>
					</FieldError>
				)}

				<Button type="submit" disabled={isSubmitting} className="w-full">
					{isSubmitting ? "Entrando..." : "Entrar"}
				</Button>
			</FieldGroup>
		</form>
	);
}
