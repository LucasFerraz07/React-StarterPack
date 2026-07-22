import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { COLOR_THEMES } from "@/lib/color-theme";
import { useAuthStore } from "@/stores/auth-store";
import { useColorThemeStore } from "@/stores/color-theme-store";
import { routes } from "@/utils/routes";

export function NavUser() {
	const navigate = useNavigate();
	const { isMobile } = useSidebar();
	const user = useAuthStore((state) => state.user);
	const signOut = useAuthStore((state) => state.signOut);
	const { theme, setTheme } = useTheme();
	const colorTheme = useColorThemeStore((state) => state.colorTheme);
	const setColorTheme = useColorThemeStore((state) => state.setColorTheme);

	async function handleSignOut() {
		await signOut();
		await navigate({ to: routes.auth.login });
	}

	if (!user) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="rounded-lg">
								<AvatarFallback className="rounded-lg">
									{user.username.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.username}</span>
								<span className="truncate text-xs text-muted-foreground">
									{user.email}
								</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<Sun />
								Aparência
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuRadioGroup
									value={theme ?? "system"}
									onValueChange={setTheme}
								>
									<DropdownMenuRadioItem value="light">
										<Sun />
										Claro
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="dark">
										<Moon />
										Escuro
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="system">
										<Monitor />
										Sistema
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<span className="size-4 rounded-full bg-primary" />
								Cor
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuLabel>Tema de cor</DropdownMenuLabel>
								<DropdownMenuRadioGroup
									value={colorTheme}
									onValueChange={(value) =>
										setColorTheme(value as typeof colorTheme)
									}
								>
									{COLOR_THEMES.map((option) => (
										<DropdownMenuRadioItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuItem onSelect={handleSignOut}>
							<LogOut />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
