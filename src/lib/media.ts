// O OpenAPI do backend tipa alguns campos de mídia nullable (crest, image_url) como
// `null` puro, pois o exemplo usado na doc não tinha valor — em runtime a API
// retorna a URL absoluta quando o registro tem mídia associada.
export function getMediaUrl(value: unknown): string | null {
	return value as string | null;
}
