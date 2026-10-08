/**
 * F10-REL-2: `npm run anexos` tiene que dejar en `submission/anexos/` solo los
 * anexos de su corrida. Aquí se prueban la limpieza previa y el recuento
 * posterior sobre carpetas temporales, sin navegador: los vídeos del 06/10 con
 * otro nombre y las capturas con la numeración antigua desaparecen; los
 * esperados se quedan. Si mañana alguien añade una página o un dispositivo y no
 * lo refleja en el catálogo, estos tests lo dicen.
 */

import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
	DIR_CAPTURAS,
	DIR_VIDEO,
	limpiarAnexos,
	nombresCapturas,
	nombresVideo,
	verificarAnexos,
} from "../scripts/anexos-catalogo";

const temporales: string[] = [];

/** Carpeta de anexos con los ficheros que se le pasen. */
function anexosDePrueba(capturas: string[], videos: string[]): string {
	const dir = mkdtempSync(join(tmpdir(), "anexos-"));
	temporales.push(dir);
	mkdirSync(join(dir, DIR_CAPTURAS), { recursive: true });
	mkdirSync(join(dir, DIR_VIDEO), { recursive: true });
	for (const f of capturas) writeFileSync(join(dir, DIR_CAPTURAS, f), "x");
	for (const f of videos) writeFileSync(join(dir, DIR_VIDEO, f), "x");
	return dir;
}

afterEach(() => {
	for (const dir of temporales.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
});

describe("anexos: lo que debe dejar la corrida del 14/10", () => {
	it("espera 32 capturas y un vídeo por dispositivo", () => {
		expect(nombresCapturas()).toHaveLength(32);
		expect(nombresVideo()).toEqual([
			"recorrido-desktop.webm",
			"recorrido-movil.webm",
		]);
	});

	it("borra los vídeos del 06/10 y las capturas con la numeración antigua", () => {
		const dir = anexosDePrueba(
			[
				...nombresCapturas(),
				"desktop-dark-03-resultados.png",
				"movil-light-04-ficha.png",
				"movil-light-05-explorar.png",
			],
			[
				...nombresVideo(),
				"desktop-oscuro-recorrido.webm",
				"movil-claro-recorrido.webm",
			],
		);

		const borrados = limpiarAnexos(dir);

		expect(borrados.sort()).toEqual([
			"capturas/desktop-dark-03-resultados.png",
			"capturas/movil-light-04-ficha.png",
			"capturas/movil-light-05-explorar.png",
			"video/desktop-oscuro-recorrido.webm",
			"video/movil-claro-recorrido.webm",
		]);
		expect(verificarAnexos(dir)).toEqual({ faltan: [], sobran: [] });
	});

	it("deja intactos los anexos esperados y los ficheros ocultos", () => {
		const dir = anexosDePrueba(nombresCapturas(), nombresVideo());
		writeFileSync(join(dir, DIR_CAPTURAS, ".gitkeep"), "");

		expect(limpiarAnexos(dir)).toEqual([]);
		expect(verificarAnexos(dir)).toEqual({ faltan: [], sobran: [] });
	});

	it("barre restos de otra corrida, con cualquier extensión", () => {
		const dir = anexosDePrueba(
			[...nombresCapturas(), "portada.png", "captura.jpg"],
			[...nombresVideo(), "page@8f1c.webm", "recorrido.mp4"],
		);

		const borrados = limpiarAnexos(dir);

		expect(borrados.sort()).toEqual([
			"capturas/captura.jpg",
			"capturas/portada.png",
			"video/page@8f1c.webm",
			"video/recorrido.mp4",
		]);
	});

	it("se niega a limpiar si hay una subcarpeta (no la borra a lo bruto)", () => {
		const dir = anexosDePrueba(nombresCapturas(), nombresVideo());
		mkdirSync(join(dir, DIR_VIDEO, "antiguos"));

		expect(() => limpiarAnexos(dir)).toThrow(/carpeta/);
		expect(() => verificarAnexos(dir)).not.toThrow();
	});

	it("dice qué falta cuando la corrida se queda a medias", () => {
		const capturas = nombresCapturas();
		const dir = anexosDePrueba(
			capturas.filter((f) => f !== "desktop-dark-01-portada.png"),
			["recorrido-desktop.webm"],
		);

		const { faltan, sobran } = verificarAnexos(dir);

		expect(faltan).toEqual([
			"capturas/desktop-dark-01-portada.png",
			"video/recorrido-movil.webm",
		]);
		expect(sobran).toEqual([]);
	});
});

describe("anexos: el repo tal como está (F10-REL-2)", () => {
	it("no deja anexos sobrantes en submission/anexos/", () => {
		const { sobran } = verificarAnexos(join(process.cwd(), "submission/anexos"));
		expect(sobran).toEqual([]);
	});

	it("en video/ no hay nada o están los dos vídeos de la corrida", () => {
		const dir = join(process.cwd(), "submission/anexos", DIR_VIDEO);
		const hay = existsSync(dir)
			? readdirSync(dir)
					.filter((f) => !f.startsWith("."))
					.sort()
			: [];
		expect([[], nombresVideo()]).toContainEqual(hay);
	});
});
