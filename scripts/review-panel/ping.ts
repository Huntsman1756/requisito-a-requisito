/**
 * review-panel/ping.ts — comprueba que NAN_API_KEY funciona sin mostrarla.
 * Uso: npm run panel:ping   (carga .env si existe; ver docs/17)
 * Hace 1 llamada mínima por modelo del panel. Nunca imprime la clave.
 */
const ENDPOINT = "https://api.nan.builders/v1/chat/completions";
const MODELS = ["deepseek-v4-flash", "qwen3.8-flash", "mimo-v2.6-flash", "gemma4"];

const key = process.env.NAN_API_KEY?.trim();
if (!key) {
	console.error("NAN_API_KEY no definida (ni en el entorno ni en .env).");
	process.exit(1);
}
console.log(`NAN_API_KEY presente (longitud ${key.length}).`);

let failures = 0;
for (const model of MODELS) {
	const started = Date.now();
	try {
		const res = await fetch(ENDPOINT, {
			method: "POST",
			headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
			body: JSON.stringify({
				model,
				messages: [
					{ role: "system", content: "Return valid JSON only." },
					{ role: "user", content: 'Responde exactamente {"ok":true}' },
				],
				response_format: { type: "json_object" },
				max_tokens: model === "deepseek-v4-flash" ? 2048 : 64,
				stream: false,
			}),
			signal: AbortSignal.timeout(90_000),
		});
		const ms = Date.now() - started;
		if (!res.ok) {
			failures++;
			console.log(`${model}: HTTP ${res.status} (${ms} ms)`);
			continue;
		}
		const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
		const content = body.choices?.[0]?.message?.content ?? "";
		console.log(`${model}: OK (${ms} ms) · respuesta JSON ${content.includes("true") ? "válida" : "inesperada"}`);
	} catch (e) {
		failures++;
		console.log(`${model}: error ${(e as Error).name}`);
	}
}
process.exit(failures ? 1 : 0);
