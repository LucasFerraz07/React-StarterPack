import { MoreHorizontalIcon } from "lucide-react";
import type { PlayerResource } from "@/api/generated/models/playerResource";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TransferMarketActionsMenu({
	player,
}: {
	player: PlayerResource;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8">
					<MoreHorizontalIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" />
		</DropdownMenu>
	);
}
