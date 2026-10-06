/**
 * review-panel/client.ts — cliente NAN compartido (docs/17 §2).
 * - Concurrencia acotada y ≤ N llamadas/minuto (ventana deslizante).
 * - Reintentos con backoff ante 429/5xx/errores de red; timeout 90 s.
 * - extractJson: desenvelopa la salida (markdown, texto previo) antes del Zod.
 * La clave solo viaja en la cabecera Authorization; nunca se registra.
 */

export const NAN_ENDPOINT = "https://api.nan.builders/v1/chat/completions";

/** Extrae el primer objeto JSON equilibrado de una salida de modelo. */
export function extractJson(raw: string): string | null {
	let s = raw.trim();
	// quita cercas de markdown ```json ... ```
	const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (fence) s = fence[1].trim();
	const start = s.indexOf("{");
	if (start < 0) return null;
	let depth = 0;
	let inStr = false;
	let esc = false;
	for (let i = start; i < s.length; i++) {
		const ch = s[i];
		if (inStr) {
			if (esc) esc = false;
			else if (ch === "\\") esc = true;
			else if (ch === '"') inStr = false;
			continue;
		}
		if (ch === '"') inStr = true;
		else if (ch === "{") depth++;
		else if (ch === "}") {
			depth--;
			if (depth === 0) return s.slice(start, i + 1);
		}
	}
	return null;
}

export interface NanCallInput {
	model: string;
	system: string;
	user: string;
	maxTokens?: number;
}

export interface NanCallResult {
	content: string;
	latencyMs: number;
	usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class NanClient {
	private stamps: number[] = [];
	private nextSlot = 0;
	constructor(
		private key: string,
		private opts: { concurrency?: number; rpm?: number; timeoutMs?: number; retries?: number } = {},
	) {}

	get concurrency() {
		return Math.min(this.opts.concurrency ?? 6, 6);
	}
	get rpm() {
		return Math.min(this.opts.rpm ?? 50, 50);
	}

	private async throttle(): Promise<void> {
		// espaciado uniforme: como máximo una petición cada 60_000/rpm ms,
		// además del tope de rpm en ventana deslizante
		const gap = Math.ceil(60_000 / this.rpm);
		for (;;) {
			const now = Date.now();
			this.stamps = this.stamps.filter((t) => now - t < 60_000);
			const slot = Math.max(now, this.nextSlot);
			if (this.stamps.length < this.rpm) {
				this.nextSlot = slot + gap;
				this.stamps.push(slot);
				const wait = slot - now;
				if (wait > 0) await sleep(wait);
				return;
			}
			await sleep(250);
		}
	}

	async call(input: NanCallInput): Promise<NanCallResult> {
		const retries = this.opts.retries ?? 4;
		let lastErr: Error | null = null;
		for (let attempt = 0; attempt <= retries; attempt++) {
			await this.throttle();
			const started = Date.now();
			try {
				const res = await fetch(NAN_ENDPOINT, {
					method: "POST",
					headers: {
						"content-type": "application/json",
						authorization: `Bearer ${this.key}`,
					},
					body: JSON.stringify({
						model: input.model,
						temperature: 0,
						max_tokens: input.maxTokens ?? 4000,
						response_format: { type: "json_object" },
						messages: [
							{ role: "system", content: input.system },
							{ role: "user", content: input.user },
						],
					}),
					signal: AbortSignal.timeout(this.opts.timeoutMs ?? 90_000),
				});
				if (res.status === 429 || res.status >= 500) {
					lastErr = new Error(`NAN ${res.status}`);
					await sleep(Math.min(45_000, 2000 * 2 ** attempt) + Math.random() * 500);
					continue;
				}
				if (!res.ok) throw new Error(`NAN ${res.status}`);
				const j = (await res.json()) as {
					choices?: { message?: { content?: string } }[];
					usage?: NanCallResult["usage"];
				};
				return {
					content: j.choices?.[0]?.message?.content ?? "",
					latencyMs: Date.now() - started,
					usage: j.usage,
				};
			} catch (e) {
				if ((e as Error).message.startsWith("NAN 4") && !(e as Error).message.startsWith("NAN 429"))
					throw e;
				lastErr = e as Error;
				await sleep(Math.min(45_000, 2000 * 2 ** attempt) + Math.random() * 500);
			}
		}
		throw lastErr ?? new Error("NAN: agotados los reintentos");
	}
}

/** Ejecuta fn sobre los elementos con un pool de tamaño n. */
export async function mapPool<T, R>(
	arr: readonly T[],
	n: number,
	fn: (t: T, i: number) => Promise<R>,
): Promise<R[]> {
	const out = new Array<R>(arr.length);
	let next = 0;
	const workers = Array.from({ length: Math.max(1, Math.min(n, arr.length)) }, async () => {
		for (;;) {
			const i = next++;
			if (i >= arr.length) return;
			out[i] = await fn(arr[i], i);
		}
	});
	await Promise.all(workers);
	return out;
}
