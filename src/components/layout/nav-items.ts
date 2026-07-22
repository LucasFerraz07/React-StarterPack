import {
	ArrowLeftRightIcon,
	HomeIcon,
	type LucideIcon,
	SettingsIcon,
	ShieldIcon,
	TrophyIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";
import { routes } from "@/utils/routes";

export interface NavSubItem {
	title: string;
	to: string;
	// Se omitido, o item aparece para qualquer usuário autenticado.
	permission?: Permission | Permission[];
	// Com `permission` como array, exige todas ao invés de apenas uma (default: any).
	requireAll?: boolean;
	// Esconde o item se o usuário tiver alguma dessas permissões (inverso de `permission`).
	hideIfPermission?: Permission | Permission[];
}

export interface NavItem {
	title: string;
	icon: LucideIcon;
	// Se omitido, o item aparece para qualquer usuário autenticado.
	permission?: Permission | Permission[];
	// Com `permission` como array, exige todas ao invés de apenas uma (default: any).
	requireAll?: boolean;
	// Esconde o item se o usuário tiver alguma dessas permissões (inverso de `permission`).
	hideIfPermission?: Permission | Permission[];
	// Item de link direto. Omita ao usar `items` para criar um grupo colapsável.
	to?: string;
	// Subitens do grupo. Quando presente, o item vira um grupo colapsável sem link próprio.
	items?: NavSubItem[];
}

export const navItems: NavItem[] = [
	{
		title: "Início",
		to: routes.app.home,
		icon: HomeIcon,
	},
	{
		title: "Ligas",
		to: routes.leagues.leagues,
		icon: TrophyIcon,
		permission: "league.view",
	},
	{
		title: "Clubes",
		to: routes.clubs.clubs,
		icon: ShieldIcon,
		permission: "club.view",
	},
	{
		title: "Transferências",
		icon: ArrowLeftRightIcon,
		hideIfPermission: "league.create",
		items: [
			{
				title: "Contratação",
				to: routes.transferMarket.contract,
			},
		],
	},
	{
		title: "Configurações",
		icon: SettingsIcon,
		items: [
			{
				title: "Assinaturas",
				to: routes.subscriptions.subscriptions,
				permission: "subscription.view",
			},
			{
				title: "Tipos de Transação",
				to: routes.transactionTypes.transactionTypes,
				permission: "transaction-type.view",
			},
			{
				title: "Imagem dos Jogadores",
				to: routes.players.image,
				permission: "player.update",
			},
			{
				title: "Minha Liga",
				to: routes.leagues.settings,
				permission: "league.view",
				hideIfPermission: "league.create",
			},
		],
	},
];
