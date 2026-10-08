/**
 * anexos-catalogo — F10-REL-2: qué ficheros tiene que dejar `npm run anexos` en
 * `submission/anexos/`, la limpieza previa y el recuento posterior.
 *
 * Vive aparte de `scripts/anexos.ts` (que necesita Playwright y arranca el
 * servidor del export) para poder probar la limpieza y el recuento sin
 * navegador: `tests/anexos-catalogo.test.ts`. Los nombres salen de aquí y de
 * ningún otro sitio: si cambia una página o un dispositivo, la limpieza y la
 * verificación cambian con él.
 *
 * Regla: en `video/` quedan los vídeos de ESTA corrida y en `capturas/` las
 * capturas que esta corrida regenera. Todo lo demás se borra antes de generar
 * —así desaparecen los `*-recorrido.webm` del 06/10 y las capturas con la
 * numeración antigua— y, si al terminar falta o sobra algo, el script falla.
 */

import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

export const DIR_CAPTURAS = "capturas";
export const DIR_VIDEO = "video";

export const PAGINAS = [
	["portada", "/"],
	["como-funciona", "/como-funciona/"],
	["ficha", "/ayudas/complemento-ayuda-infancia/"],
	["explorar", "/explorar/"],
	["observatorio", "/observatorio/"],
	["datos", "/datos/"],
	["como-verificamos", "/como-verificamos/"],
] as const;
// «resultados» va con la numeración 08 (después de las páginas estáticas).
export const PAGINA_RESULTADOS = "08-resultados";

export const DISPOSITIVOS = [
	["desktop", { width: 1366, height: 768 }],
	["movil", { width: 390, height: 844 }],
] as const;

const ESQUEMAS = ["light", "dark"] as const;

/** Capturas que debe dejar una corrida completa: 2 dispositivos × 2 esquemas × 8. */
export function nombresCapturas(): string[] {
	const nombres: string[] = [];
	for (const [disp] of DISPOSITIVOS) {
		for (const scheme of ESQUEMAS) {
			for (let i = 0; i < PAGINAS.length; i++) {
				const numero = String(i + 1).padStart(2, "0");
				nombres.push(`${disp}-${scheme}-${numero}-${PAGINAS[i][0]}.png`);
			}
			nombres.push(`${disp}-${scheme}-${PAGINA_RESULTADOS}.png`);
		}
	}
	return nombres;
}

/** Vídeos que debe dejar una corrida completa: uno por dispositivo. */
export function nombresVideo(): string[] {
	return DISPOSITIVOS.map(([disp]) => `recorrido-${disp}.webm`);
}

/** Lo que una corrida completa debe dejar en `submission/anexos/`. */
export function anexosEsperados(): { capturas: string[]; video: string[] } {
	return { capturas: nombresCapturas(), video: nombresVideo() };
}

/**
 * Borra de `submission/anexos/` todo lo que no vaya a regenerar la corrida
 * actual, con cualquier extensión (no solo .png/.webm). Devuelve las rutas
 * borradas para dejarlas en el log —es la evidencia de la limpieza—. Los
 * ficheros ocultos (`.gitkeep`) se respetan y una subcarpeta es un error: ahí
 * no debe haber nada que no genere este script.
 */
export function limpiarAnexos(outDir: string): string[] {
	const { capturas, video } = anexosEsperados();
	const borrados: string[] = [];
	for (const [dir, esperados] of [
		[DIR_CAPTURAS, capturas],
		[DIR_VIDEO, video],
	] as const) {
		const abs = join(outDir, dir);
		if (!existsSync(abs)) continue;
		for (const fichero of readdirSync(abs)) {
			if (fichero.startsWith(".")) continue;
			if (statSync(join(abs, fichero)).isDirectory()) {
				const ruta = `${dir}/${fichero}`;
				throw new Error(
					`anexos: ${ruta} es una carpeta y no la genera este script; bórrala a mano`,
				);
			}
			if (!esperados.includes(fichero)) {
				unlinkSync(join(abs, fichero));
				borrados.push(`${dir}/${fichero}`);
			}
		}
	}
	return borrados;
}

/**
 * Recuento después de generar: lo que falta y lo que sobra. El script falla si
 * cualquiera de las dos listas no está vacía (fail-closed: antes quedaría un
 * paquete con anexos de otra corrida sin que nadie se enterara).
 */
export function verificarAnexos(outDir: string): { faltan: string[]; sobran: string[] } {
	const { capturas, video } = anexosEsperados();
	const faltan: string[] = [];
	const sobran: string[] = [];
	for (const [dir, esperados] of [
		[DIR_CAPTURAS, capturas],
		[DIR_VIDEO, video],
	] as const) {
		const abs = join(outDir, dir);
		const hay = existsSync(abs)
			? readdirSync(abs).filter((f) => !f.startsWith("."))
			: [];
		for (const esperado of esperados) {
			if (!hay.includes(esperado)) faltan.push(`${dir}/${esperado}`);
		}
		for (const fichero of hay) {
			const ruta = `${dir}/${fichero}`;
			if (statSync(join(abs, fichero)).isDirectory() || !esperados.includes(fichero)) {
				sobran.push(ruta);
			}
		}
	}
	return { faltan, sobran };
}
