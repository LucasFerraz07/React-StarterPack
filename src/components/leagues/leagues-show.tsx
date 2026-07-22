import { format } from "date-fns";
import { PencilIcon } from "lucide-react";
import * as React from "react";
import { useShowLeague } from "@/api/generated/league/league";
import { useIndexLeagueCategoryPrice } from "@/api/generated/league-category-price/league-category-price";
import type { LeagueCategoryPriceResource } from "@/api/generated/models/leagueCategoryPriceResource";
import { LeagueCategoryPriceEditDialog } from "@/components/leagues/league-category-price-edit-dialog";
import { LeagueEditDialog } from "@/components/leagues/leagues-edit-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissionsContext } from "@/providers/permissions-provider";

interface LeagueShowProps {
	leagueId: string;
}

const categoryLabels: Record<string, string> = {
	white: "Branco",
	bronze: "Bronze",
	silver: "Prata",
	gold: "Ouro",
	black: "Preta",
};

function formatDate(value: string) {
	return format(new Date(value), "dd/MM/yyyy");
}

function formatCurrency(value: string) {
	const numericValue = Number(value);
	if (Number.isNaN(numericValue)) return "—";
	return numericValue.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
}

function DetailRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value}</span>
		</div>
	);
}

function CategoryPriceCard({
	categoryPrice,
	canEdit,
}: {
	categoryPrice: LeagueCategoryPriceResource;
	canEdit: boolean;
}) {
	const [editOpen, setEditOpen] = React.useState(false);

	return (
		<Card size="sm">
			<CardHeader>
				<CardTitle>
					{categoryLabels[categoryPrice.category] ?? categoryPrice.category}
				</CardTitle>
				{canEdit && (
					<CardAction>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setEditOpen(true)}
						>
							<PencilIcon />
						</Button>
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<DetailRow label="Overall mínimo" value={categoryPrice.min_overall} />
				<DetailRow
					label="Salário base"
					value={formatCurrency(categoryPrice.base_salary)}
				/>
				<DetailRow
					label="Passe base"
					value={formatCurrency(categoryPrice.base_passe)}
				/>
			</CardContent>
			{canEdit && (
				<LeagueCategoryPriceEditDialog
					categoryPrice={categoryPrice}
					open={editOpen}
					onOpenChange={setEditOpen}
				/>
			)}
		</Card>
	);
}

export function LeagueShow({ leagueId }: LeagueShowProps) {
	const { hasPermission } = usePermissionsContext();
	const canEdit = hasPermission("league.update");
	const [editOpen, setEditOpen] = React.useState(false);

	const {
		data: leagueData,
		isLoading: isLeagueLoading,
		isError: isLeagueError,
	} = useShowLeague(leagueId);
	const league = leagueData?.data;

	const { data: categoryPricesData, isLoading: isCategoryPricesLoading } =
		useIndexLeagueCategoryPrice({ league_id: leagueId });
	const categoryPrices = categoryPricesData?.data.data ?? [];

	if (isLeagueLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-40 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}

	if (isLeagueError || !league) {
		return (
			<p className="text-sm text-destructive">
				Não foi possível carregar as informações da liga.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						{league.name}
						{league.is_active ? (
							<Badge variant="default">Ativa</Badge>
						) : (
							<Badge variant="outline">Inativa</Badge>
						)}
					</CardTitle>
					{canEdit && (
						<CardAction>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setEditOpen(true)}
							>
								<PencilIcon />
							</Button>
						</CardAction>
					)}
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-medium">Assinatura</h3>
						<DetailRow label="Plano" value={league.subscription?.name ?? "—"} />
						<DetailRow
							label="Início"
							value={formatDate(league.subscription_start)}
						/>
						<DetailRow
							label="Vencimento"
							value={formatDate(league.subscription_end)}
						/>
					</div>

					<Separator />

					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-medium">Responsável</h3>
						<DetailRow
							label="Nome completo"
							value={league.owner?.full_name ?? "—"}
						/>
						<DetailRow label="CPF" value={league.owner?.cpf ?? "—"} />
						<DetailRow label="Email" value={league.owner?.user?.email ?? "—"} />
						<DetailRow
							label="Telefone"
							value={league.owner?.user?.phone ?? "—"}
						/>
					</div>

					<Separator />

					<div className="flex flex-col gap-2">
						<h3 className="text-sm font-medium">Limites</h3>
						<DetailRow
							label="Jogadores"
							value={league.player_limit ?? "Sem limite"}
						/>
						<DetailRow
							label="Categoria prata"
							value={league.silver_limit ?? "Sem limite"}
						/>
						<DetailRow
							label="Categoria ouro"
							value={league.golden_limit ?? "Sem limite"}
						/>
						<DetailRow
							label="Categoria black"
							value={league.black_limit ?? "Sem limite"}
						/>
						<DetailRow
							label="Contratos de multa"
							value={league.mulct_contract_limit}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-3">
				<h2 className="text-lg font-semibold tracking-tight">
					Preços por Categoria
				</h2>
				{isCategoryPricesLoading ? (
					<Skeleton className="h-32 w-full" />
				) : (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{categoryPrices.map((categoryPrice) => (
							<CategoryPriceCard
								key={categoryPrice.id}
								categoryPrice={categoryPrice}
								canEdit={canEdit}
							/>
						))}
					</div>
				)}
			</div>

			{canEdit && (
				<LeagueEditDialog
					league={league}
					open={editOpen}
					onOpenChange={setEditOpen}
				/>
			)}
		</div>
	);
}
