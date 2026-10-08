import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ruleSetSchema } from "../../src/lib/eligibility-engine/schema";

/**
 * Guardia de dureza declarada (F3-M): un mutante `hard` invertido en un
 * requisito debe hacer fallar al menos un test. Cuando el dominio de
 * perfiles no discrimina el flag (otro requisito duro ya decide el
 * veredicto, p. ej. dos requisitos territoriales), el mutante es
 * equivalente en comportamiento y solo una aserción declarativa lo
 * detecta — este pin es esa red. Si una regla cambia su dureza
 * legítimamente, se actualiza la entrada aquí con su motivo en el informe.
 */
const EXPECTED: Record<string, boolean> = {
	"anticipos-docentes-cm.json/funcionario-docente-activo": true,
	"asignacion-hijo-a-cargo.json/causante-con-discapacidad": false,
	"ayto-emergencia-social.json/empadronado-madrid": true,
	"ayto-emergencia-social.json/mayor-edad": true,
	"ayto-emergencia-social.json/carencia-recursos": false,
	// F10-REG-6: la norma admite «prever residir» y el cuestionario solo
	// pregunta empadronamiento ⇒ soft (hard F sería un falso negativo).
	"ayto-escuela-infantil.json/residir-madrid": false,
	"ayto-escuela-infantil.json/hijo-primer-ciclo": true,
	"ayto-ibi-familia-numerosa.json/empadronado-madrid": true,
	"ayto-ibi-familia-numerosa.json/titulo-familia-numerosa": true,
	"ayto-ibi-familia-numerosa.json/vivienda-habitual-propia": true,
	"ayto-tarjeta-azul-discapacidad.json/empadronado-municipio-madrid": true,
	"ayto-tarjeta-azul-discapacidad.json/discapacidad-min-33": true,
	"ayto-tarjeta-azul-discapacidad.json/renta-max-3-iprem": true,
	"becas-mec-universidad-2026-2027.json/estudiante-universitario": false,
	"bono-cultural-joven.json/nacido-en-2008": true,
	"bono-social-electrico.json/alguna-via-vulnerable": false,
	"bono-social-termico.json/suministro-cm": true,
	"bono-social-termico.json/alguna-via-vulnerable": false,
	"cese-actividad-autonomos.json/autonomo-alta-reta": false,
	"cm-reintegro-accidentes-trabajo.json/empleado-publico-cm": true,
	"complemento-ayuda-infancia.json/menor-en-unidad": true,
	"complemento-ayuda-infancia.json/residencia-espana-1a": true,
	"complemento-ayuda-infancia.json/edad-titular": true,
	"descuento-transporte-familia-numerosa.json/titulo-familia-numerosa": true,
	"fuenlabrada-fuenlacarenet-2026.json/empadronado-fuenlabrada": true,
	"fuenlabrada-fuenlacarenet-2026.json/menores-a-cargo": true,
	"fuenlabrada-prestaciones-sociales.json/mayor-edad": true,
	"fuenlabrada-prestaciones-sociales.json/empadronado-fuenlabrada": true,
	"fuenlabrada-prestaciones-sociales.json/carencia-ingresos": false,
	"imv.json/edad-minima": true,
	"imv.json/residencia-espana-1a": false,
	"imv.json/ingresos-inferiores-renta-garantizada": false,
	"leganes-prestaciones-especial-necesidad.json/empadronado-leganes-6m": true,
	"leganes-prestaciones-especial-necesidad.json/limite-ingresos-anexo-i": false,
	"madrid-abono-transporte-65.json/edad-65": true,
	"madrid-abono-transporte-65.json/empadronado-municipio-madrid": true,
	"madrid-abono-transporte-65.json/renta-iprem": false,
	"madrid-abono-transporte-infantil.json/menor-0-14-a-cargo": true,
	"madrid-abono-transporte-infantil.json/residencia-municipio-crtm": false,
	"madrid-abono-transporte-joven.json/edad-min-15": true,
	"madrid-abono-transporte-joven.json/edad-max-26": true,
	"madrid-abono-transporte-joven.json/residencia-municipio-crtm": false,
	"madrid-accede-prestamo-libros.json/alumno-centro-sostenido": false,
	"madrid-ayuda-pago-unico-vg.json/residente-cm": true,
	"madrid-ayuda-pago-unico-vg.json/renta-75-smi": false,
	"madrid-ayudas-alquiler-plan-estatal.json/mayoria-edad": true,
	"madrid-ayudas-alquiler-plan-estatal.json/vivienda-en-madrid": true,
	"madrid-ayudas-alquiler-plan-estatal.json/ingresos-max-5iprem": true,
	"madrid-ayudas-alquiler-plan-estatal.json/sector-preferente": false,
	"madrid-ayudas-alquiler-plan-estatal.json/contrato-alquiler": false,
	"madrid-ayudas-nacimiento-adopcion-multiple.json/empadronado-madrid": true,
	"madrid-ayudas-nacimiento-adopcion-multiple.json/dos-o-mas-personas-cargo": true,
	"madrid-ayudas-nacimiento-adopcion-multiple.json/ingresos-referencia": false,
	"madrid-ayudas-nacimiento-general.json/empadronado-municipio-cm": true,
	"madrid-ayudas-nacimiento-general.json/edad-max-30": true,
	"madrid-ayudas-nacimiento-general.json/empadronamiento-5-en-10": false,
	"madrid-ayudas-nacimiento-general.json/renta-irpf": false,
	"madrid-ayudas-urgencia-social.json/ambito-territorial-cm": true,
	"madrid-ayudas-urgencia-social.json/fuera-madrid-capital": true,
	"madrid-ayudas-urgencia-social.json/sin-recursos-basicos": false,
	"madrid-beca-comedor-escolar.json/hijo-en-edad-escolar": true,
	"madrid-beca-comedor-escolar.json/centro-en-comunidad-madrid": false,
	"madrid-beca-comedor-escolar.json/via-economica-o-colectivo": false,
	"madrid-becas-bachillerato-centros-privados.json/estudiante-bachillerato": false,
	"madrid-becas-bachillerato-centros-privados.json/renta-familiar-baja": false,
	"madrid-bono-alquiler-joven.json/mayoria-edad": true,
	"madrid-bono-alquiler-joven.json/edad-max-35": true,
	"madrid-bono-alquiler-joven.json/vivienda-en-madrid": true,
	"madrid-bono-alquiler-joven.json/ingresos-3iprem": true,
	"madrid-bono-alquiler-joven.json/alquiler-o-condiciones": false,
	"madrid-cheque-escuela-infantil.json/hijo-menor-3": true,
	"madrid-cheque-escuela-infantil.json/renta-limite": false,
	"madrid-renta-minima-insercion.json/residencia-permanente-cm": true,
	"madrid-renta-minima-insercion.json/residencia-un-ano": true,
	"madrid-renta-minima-insercion.json/edad-25-65": true,
	"madrid-renta-minima-insercion.json/ingresos-inferiores-rmi": false,
	"madrid-titulo-familia-numerosa.json/residencia-cm": true,
	"madrid-titulo-familia-numerosa.json/hijos-minimo": true,
	"madrid-titulo-familia-numerosa.json/edad-hijos": true,
	"madrid-titulo-familia-numerosa.json/caso-general-3-hijos": false,
	"mostoles-prestaciones-sociales.json/mayor-edad": true,
	"mostoles-prestaciones-sociales.json/empadronado-mostoles": true,
	"mostoles-prestaciones-sociales.json/carencia-ingresos": false,
	"pension-incapacidad-permanente.json/edad-inferior-jubilacion-comunes": false,
	"pension-jubilacion-contributiva.json/edad-minima-52": true,
	"pension-no-contributiva.json/reside-cm": false,
	"pension-no-contributiva.json/edad-65-o-discapacidad": true,
	"pension-no-contributiva.json/residencia-espana-2y": false,
	"pension-orfandad.json/edad-en-fallecimiento": false,
	"pension-viudedad.json/edad-65-cuantia": false,
	"pension-viudedad.json/cargas-familiares-70": false,
	"prestacion-cuidado-menor-enfermedad-grave.json/persona-a-cargo": true,
	"prestacion-cuidado-menor-enfermedad-grave.json/trabajadora-afiliada-alta": true,
	"prestacion-cuidador-no-profesional.json/empadronado-cm": true,
	"prestacion-cuidador-no-profesional.json/dependencia-reconocida": false,
	"prestacion-cuidador-no-profesional.json/residencia-espana-5y2": false,
	"prestacion-cuidador-no-profesional__v-2026-10-23.json/empadronado-cm": true,
	"prestacion-cuidador-no-profesional__v-2026-10-23.json/dependencia-reconocida": false,
	"prestacion-cuidador-no-profesional__v-2026-10-23.json/residencia-espana-5y2": false,
	"prestacion-desempleo-contributiva.json/situacion-legal-desempleo": false,
	"prestacion-nacimiento-adopcion-familia-numerosa-monoparental-discapacidad.json/colectivo-familiar": true,
	"prestacion-nacimiento-cuidado-menor.json/menor-a-cargo": true,
	"prestacion-nacimiento-cuidado-menor.json/persona-trabajadora": false,
	"prestaciones-dependencia-saad.json/empadronado-cm": true,
	"prestaciones-dependencia-saad.json/residencia-espana-5y2": false,
	"prestaciones-dependencia-saad.json/sin-reconocimiento-previo": false,
	"prestaciones-dependencia-saad__v-2026-10-23.json/empadronado-cm": true,
	"prestaciones-dependencia-saad__v-2026-10-23.json/residencia-espana-5y2": false,
	"prestaciones-dependencia-saad__v-2026-10-23.json/sin-reconocimiento-previo": false,
	"prestamos-personal-publico-cm.json/personal-laboral-cm": true,
	"sermas-ortoprotesica-desplazamiento.json/derecho-asistencia-sermas": false,
	"sermas-reintegro-gastos-sanitarios.json/titular-tarjeta-sermas": false,
	"subsidio-desempleo.json/desempleo": false,
	"subsidio-desempleo.json/carencia-rentas": false,
	"subsidio-mayores-52.json/edad-52": true,
	"subsidio-mayores-52.json/desempleo": false,
};

describe("hard flags declarados", () => {
	const dir = join(process.cwd(), "data", "eligibility", "rules");
	const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
	const actual = files.flatMap((f) => {
		const rs = ruleSetSchema.parse(
			JSON.parse(readFileSync(join(dir, f), "utf8")),
		);
		return rs.requirements.map((r) => `${f}/${r.id}`);
	});
	it("cada requisito tiene su dureza pinneada", () => {
		const missing = actual.filter((k) => !(k in EXPECTED));
		const stale = Object.keys(EXPECTED).filter((k) => !actual.includes(k));
		expect(missing, `sin pin: ${missing.join(", ")}`).toEqual([]);
		expect(stale, `pin huérfano: ${stale.join(", ")}`).toEqual([]);
	});
	const byFile = new Map(
		files.map((f) => [
			f,
			ruleSetSchema.parse(
				JSON.parse(readFileSync(join(dir, f), "utf8")),
			),
		]),
	);
	it.each(actual)("%s conserva su flag hard declarado", (key) => {
		const [file, id] = key.split("/");
		const req = byFile.get(file)!.requirements.find((r) => r.id === id);
		expect(req!.hard).toBe(EXPECTED[key]);
	});
});
