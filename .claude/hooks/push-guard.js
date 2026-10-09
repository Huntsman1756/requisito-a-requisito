// PreToolUse (Bash y PowerShell): bloquea un git push forzado y un git push que
// comparte orden con una tubería (la tubería oculta el código de salida de lo
// que corre antes, p. ej. `git pull --rebase | tail -1 && git push`).
// Código de salida 2 = bloquea la llamada y muestra stderr al modelo.
let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
	let command = "";
	try {
		command = JSON.parse(raw)?.tool_input?.command ?? "";
	} catch {
		process.exit(0);
	}
	// El texto no es orden: se quitan heredocs y cadenas entre comillas.
	command = command
		.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n\s*\2\b/g, "")
		.replace(/'[^']*'/g, "''")
		.replace(/"(?:\\.|[^"\\])*"/g, '""');
	// `push` como subcomando de git (admite `git -C ruta push`), no como parte
	// de otra palabra (`git add push-guard.js` no es un push).
	const PUSH =
		/\bgit(?:\s+(?:-[Cc]\s+\S+|--?[\w-]+(?:=\S+)?))*\s+push(?![\w-])/;
	if (!PUSH.test(command)) process.exit(0);
	const singlePipe = /(^|[^|])\|([^|]|$)/.test(command);
	const forced = new RegExp(
		`${PUSH.source}[^\\n;&|]*(\\s--force(-with-lease)?\\b|\\s-f\\b|\\s\\+[^\\s]+)`,
	).test(command);
	if (forced) {
		console.error(
			"push-guard: push forzado bloqueado (AGENTS.md §4.14). Si de verdad hace falta, lo ejecuta Daniel.",
		);
		process.exit(2);
	}
	if (singlePipe) {
		console.error(
			"push-guard: un git push no va en la misma orden que una tubería (AGENTS.md §4.14). Ejecuta `git pull --rebase` solo, comprueba que sale con código 0 y haz `git push` en una orden aparte.",
		);
		process.exit(2);
	}
	process.exit(0);
});
