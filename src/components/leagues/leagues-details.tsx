import { format } from "date-fns";
import { useShowLeague } from "@/api/generated/league/league";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface LeagueDetailsDialogProps {
	leagueId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function formatDate(value: string) {
	return format(new Date(value), "dd/MM/yyyy");
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

export function LeagueDetailsDialog({
	leagueId,
	open,
	onOpenChange,
}: LeagueDetailsDialogProps) {
	const { data, isLoading, isError } = useShowLeague(leagueId, {
		query: { enabled: open },
	});

	const league = data?.data;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{isLoading ? <Skeleton className="h-5 w-40" /> : league?.name}
						{league &&
							(league.is_active ? (
								<Badge variant="default">Ativa</Badge>
							) : (
								<Badge variant="outline">Inativa</Badge>
							))}
					</DialogTitle>
				</DialogHeader>

				{isLoading && (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
					</div>
				)}

				{isError && (
					<p className="text-sm text-destructive">
						Não foi possível carregar os detalhes da liga.
					</p>
				)}

				{league && (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<h3 className="text-sm font-medium">Assinatura</h3>
							<DetailRow
								label="Plano"
								value={league.subscription?.name ?? "—"}
							/>
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
							<DetailRow
								label="Email"
								value={league.owner?.user?.email ?? "—"}
							/>
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
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
