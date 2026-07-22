import { z } from "zod";
import { ClubRegion } from "@/api/generated/models/clubRegion";

const MAX_CREST_SIZE = 2 * 1024 * 1024;
const ACCEPTED_CREST_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/svg+xml",
];

export const clubRegionLabels: Record<ClubRegion, string> = {
	[ClubRegion.americas]: "Américas",
	[ClubRegion.europe]: "Europa",
	[ClubRegion.national]: "Nacional",
};

export const clubSchema = z.object({
	name: z.string().min(1, "Informe um nome para o clube").max(100),
	region: z.enum(ClubRegion, "Escolha uma região"),
	crest: z
		.instanceof(File, { message: "Selecione uma imagem para o escudo" })
		.refine(
			(file) => file.size <= MAX_CREST_SIZE,
			"O escudo deve ter no máximo 2MB",
		)
		.refine(
			(file) => ACCEPTED_CREST_TYPES.includes(file.type),
			"Formato inválido. Use PNG, JPG, WEBP ou SVG",
		)
		.nullable(),
});

export type ClubSchema = z.infer<typeof clubSchema>;
