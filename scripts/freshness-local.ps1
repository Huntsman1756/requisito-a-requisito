# freshness-local.ps1 — R7-LOCAL: revalidación diaria de las fuentes que el
# CI no alcanza (sedes que bloquean IPs de datacenter: seg-social.es,
# comunidad.madrid). Corre en el Windows de Daniel bajo tarea programada
# «Requisito-FreshnessLocal» (autorizada en ADR-049).
#
# Reglas:
#  - Si el árbol tiene cambios sin commitear o el pull no es fast-forward,
#    NO hace nada (nunca pisa trabajo del agente) y lo anota en el log.
#  - Ejecuta npm run freshness:local (--only-skipped, FRESHNESS_LOCAL=1).
#  - Solo commitea rutas concretas de frescura; nunca otras.
#  - Log: F:\AgentState\datawardsmadrid\freshness-local.log
#
# Pausar:  schtasks /Change /TN "Requisito-FreshnessLocal" /DISABLE
# Volver:  schtasks /Change /TN "Requisito-FreshnessLocal" /ENABLE
# Quitar:  schtasks /Delete /TN "Requisito-FreshnessLocal" /F

# "Continue", no "Stop": en PowerShell 5.1, `git ... 2>&1` convierte cada línea
# de stderr (p. ej. el «From https://…» normal de git fetch) en un error, y con
# "Stop" abortaba el script entero (09/10: ERROR: From https://github.com/…).
# Los fallos de git/npm se detectan siempre por $LASTEXITCODE.
$ErrorActionPreference = "Continue"
$repo = "F:\_Proyectos\datawardsmadrid"
$logDir = "F:\AgentState\datawardsmadrid"
$log = Join-Path $logDir "freshness-local.log"

function Log($msg) {
	$line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $msg"
	Add-Content -Path $log -Value $line -Encoding UTF8
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Log "inicio"

try {
	Push-Location $repo

	# Rutas que esta tarea commitea (paso 4).
	$paths = @(
		"data/eligibility/sources",
		"data/eligibility/freshness-stale.json",
		"data/freshness",
		"data/catalog/leads-new.json"
	)

	# 1. Árbol limpio obligatorio: con trabajo a medias no se hace nada.
	# Un fichero sin seguimiento (??) fuera de $paths (p. ej. evidencia de una
	# sesión de agente) no bloquea: el pull ff-only falla solo si lo pisaría y
	# el paso 4 nunca lo añade. Dentro de $paths sí bloquea.
	$status = git status --porcelain
	if ($LASTEXITCODE -ne 0) { throw "git status falló" }
	$dirty = @($status | Where-Object {
		if (-not $_.StartsWith("?? ")) { return $true }
		$f = $_.Substring(3).Trim('"')
		foreach ($p in $paths) { if ($f.StartsWith($p)) { return $true } }
		return $false
	})
	if ($dirty.Count -gt 0) {
		Log "árbol con cambios sin commitear — sin tocar nada"
		Pop-Location
		exit 0
	}

	# 2. Si la rama local va por delante de origin (commit de frescura que no
	# subió ayer), intentar rebase + push ANTES de revalidar; si no puede,
	# se registra y se para (no se acumulan más commits locales).
	git fetch origin main 2>&1 | Out-Null
	if ($LASTEXITCODE -ne 0) { throw "git fetch falló" }
	$ahead = [int](git rev-list --count "origin/main..HEAD")
	if ($ahead -gt 0) {
		Log "rama local adelantada $ahead — intento de rebase + push previo"
		git rebase origin/main 2>&1 | Out-Null
		if ($LASTEXITCODE -ne 0) {
			$conflictos = git status --porcelain | Select-String "^UU "
			if ($conflictos -and ($conflictos | Select-String -NotMatch "runs\.jsonl").Count -eq 0) {
				node scripts/merge-jsonl.mjs . data/freshness/runs.jsonl 2>&1 | Out-Null
				git add data/freshness/runs.jsonl | Out-Null
				git -c core.editor=true rebase --continue 2>&1 | Out-Null
			}
			if ($LASTEXITCODE -ne 0) {
				git rebase --abort 2>&1 | Out-Null
				Log "rebase previo no resoluble — sin tocar nada (commit local pendiente)"
				Pop-Location
				exit 1
			}
		}
		git push 2>&1 | Out-Null
		if ($LASTEXITCODE -ne 0) {
			Log "push previo falló — sin tocar nada (commit local pendiente)"
			Pop-Location
			exit 1
		}
		Log "commit local pendiente ya subido"
		$ahead = 0
	}
	# Pull fast-forward only. Si no avanza limpio, se aborta.
	git pull --ff-only 2>&1 | Out-Null
	if ($LASTEXITCODE -ne 0) {
		Log "git pull --ff-only no posible — sin tocar nada"
		Pop-Location
		exit 0
	}

	# 3. Revalidación de las fuentes saltadas por el CI.
	$out = npm run freshness:local 2>&1 | Out-String
	Log ("freshness:local -> " + ($out -split "`n" | Where-Object { $_ -match "fuentes:|STALE|leads" } | Select-Object -First 6) -join " | ")
	# exit 2 = corrida anómala (red degradada): no se commitea nada
	if ($LASTEXITCODE -eq 2) {
		Log "corrida anómala (exit 2) — sin commit"
		Pop-Location
		exit 0
	}
	if ($LASTEXITCODE -ne 0) {
		Log "freshness:local falló (exit $LASTEXITCODE) — sin commit"
		Pop-Location
		exit 0
	}

	# 4. Stage solo de las rutas de frescura; si no hay cambios, fin.
	foreach ($p in $paths) { if (Test-Path $p) { git add -- $p } }
	git diff --cached --quiet
	if ($LASTEXITCODE -eq 0) {
		Log "sin cambios que commitear"
		Pop-Location
		exit 0
	}

	# 5. Commit de frescura y push (con pull --rebase antes, sin force).
	git commit -m "chore(freshness-local): revalidación periódica de fuentes saltadas" | Out-Null
	if ($LASTEXITCODE -ne 0) { throw "git commit falló" }
	$pushed = $false
	foreach ($i in 1..3) {
		git fetch origin main 2>&1 | Out-Null
		git rebase origin/main 2>&1 | Out-Null
		if ($LASTEXITCODE -ne 0) {
			# Único conflicto admisible: runs.jsonl (append en ambos lados) —
			# se resuelve en UTF-8 y sin reordenar con scripts/merge-jsonl.mjs.
			$conflictos = git status --porcelain | Select-String "^UU "
			if ($conflictos -and ($conflictos | Select-String -NotMatch "runs\.jsonl").Count -eq 0) {
				node scripts/merge-jsonl.mjs . data/freshness/runs.jsonl 2>&1 | Out-Null
				git add data/freshness/runs.jsonl | Out-Null
				git -c core.editor=true rebase --continue 2>&1 | Out-Null
				if ($LASTEXITCODE -ne 0) {
					Log "rebase --continue falló tras resolver runs.jsonl — aborto limpio"
					git rebase --abort 2>&1 | Out-Null
					Pop-Location
					exit 1
				}
			}
			else {
				Log "rebase con conflicto no resoluble — sin tocar; el commit queda local"
				git rebase --abort 2>&1 | Out-Null
				Pop-Location
				exit 1
			}
		}
		git push 2>&1 | Out-Null
		if ($LASTEXITCODE -eq 0) { $pushed = $true; break }
		Log "push rechazado (intento $i) — reintento"
		Start-Sleep -Seconds (20 * $i)
	}
	if (-not $pushed) {
		Log "push rechazado tras 3 intentos — el commit queda local, se reintenta mañana"
		Pop-Location
		exit 1
	}
	Log "fin ok — commit y push de frescura"
	Pop-Location
} catch {
	Log "ERROR: $($_.Exception.Message)"
	exit 1
}
