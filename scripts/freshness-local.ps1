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

$ErrorActionPreference = "Stop"
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

	# 1. Árbol limpio obligatorio: con trabajo a medias no se hace nada.
	$dirty = git status --porcelain
	if ($LASTEXITCODE -ne 0) { throw "git status falló" }
	if ($dirty) {
		Log "árbol con cambios sin commitear — sin tocar nada"
		Pop-Location
		exit 0
	}

	# 2. Pull fast-forward only. Si no avanza limpio, se aborta.
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
	$paths = @(
		"data/eligibility/sources",
		"data/eligibility/freshness-stale.json",
		"data/freshness",
		"data/catalog/leads-new.json"
	)
	foreach ($p in $paths) { if (Test-Path $p) { git add -- $p } }
	git diff --cached --quiet
	if ($LASTEXITCODE -eq 0) {
		Log "sin cambios que commitear"
		Pop-Location
		exit 0
	}

	# 5. Commit de frescura y push.
	git commit -m "chore(freshness-local): revalidación periódica de fuentes saltadas" | Out-Null
	if ($LASTEXITCODE -ne 0) { throw "git commit falló" }
	git push 2>&1 | Out-Null
	if ($LASTEXITCODE -ne 0) {
		Log "commit hecho pero push falló (se reintenta en la próxima corrida)"
		Pop-Location
		exit 0
	}
	Log "fin ok — commit y push de frescura"
	Pop-Location
} catch {
	Log "ERROR: $($_.Exception.Message)"
	exit 1
}
