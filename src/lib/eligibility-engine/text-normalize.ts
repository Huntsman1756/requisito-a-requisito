/**
 * Normalización de texto de fuentes oficiales (docs/08 §2).
 * Determinista e idempotente: es la base de comparación de extractos (G4)
 * y de los hashes textSha256/excerptSha256.
 */

const TYPO_QUOTES: Record<string, string> = {
	"«": '"',
	"»": '"',
	"“": '"',
	"”": '"',
	"„": '"',
	"‘": "'",
	"’": "'",
	"‚": "'",
	"′": "'",
	"″": '"',
};

export function normalizeText(raw: string): string {
	let s = raw.normalize("NFC");
	// Comillas tipográficas -> rectas
	s = s.replace(/[«»“”„‘’‚′″]/g, (c) => TYPO_QUOTES[c] ?? c);
	// Cortes de línea con guion: "administra-\ntiva" -> "administrativa"
	s = s.replace(/(\w)-\s*\r?\n\s*(\w)/g, "$1$2");
	// Espacios no separadores -> espacio normal (\s no los cubre en JS)
	s = s.replace(/[   -    　﻿]/g, " ");
	// Colapsar todo espacio en blanco
	s = s.replace(/\s+/g, " ");
	return s.trim();
}
