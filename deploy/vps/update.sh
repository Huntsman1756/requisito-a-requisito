#!/usr/bin/env bash
# /opt/requisito/update.sh — actualizador PULL del espejo requisito.h1756.es
# (ADR-053). Corre cada 10 min como usuario `requisito` (systemd timer).
#
#  1) descarga manifest.json de la release fija `vps-latest`;
#  2) si el commit == el de CURRENT, sale;
#  3) descarga site.tar.gz y verifica su sha256; si no cuadra, aborta;
#  4) extrae en releases/<commit>/ y verifica el sha256 de
#     datos/elegibilidad/bundle.json == manifest.bundleSha256 + index.html;
#  5) si mode == strict, exige humanReview=approved en todas las reglas
#     (la misma puerta que release:verify — fail-closed);
#  6) switch atómico de CURRENT (ln -s + mv -T), comprobación HTTP a través
#     de Traefik y rollback automático a PREVIOUS si falla;
#  7) poda a CURRENT + PREVIOUS; log en journald (tag requisito-update).
#
# REQUISITO_RELEASE_URL permite apuntar a una release de prueba
# (ensayos C3/C4) sin tocar el script.
set -euo pipefail

RELEASE_URL="${REQUISITO_RELEASE_URL:-https://github.com/Huntsman1756/requisito-a-requisito/releases/download/vps-latest}"
DATA=/data/requisito
SITE="${REQUISITO_SITE:-https://requisito.h1756.es}"
FAILS_FILE="$DATA/.fail-count"

log()  { logger -t requisito-update -p user.info -- "$*"; }
warn() { logger -t requisito-update -p user.warning -- "$*"; }

fail() {
	warn "ERROR: $*"
	local n
	n=$(cat "$FAILS_FILE" 2>/dev/null || echo 0)
	n=$((n + 1))
	echo "$n" > "$FAILS_FILE"
	if [ "$n" -ge 3 ]; then
		warn "$n fallos seguidos — se requiere revisión manual"
		# Pendiente: aviso por Telegram (sin canal reutilizable sin secretos
		# nuevos — documentado en docs/11 del repo y baseline/CAMBIOS.md).
	fi
	exit 1
}

ok() {
	echo 0 > "$FAILS_FILE"
	log "$*"
}

# --- 1) manifiesto ---
manifest=$(curl --fail --proto '=https' -fsSL --max-time 30 \
	"$RELEASE_URL/manifest.json") || fail "no se pudo descargar manifest.json"
commit=$(printf '%s' "$manifest" | jq -r '.commit // empty')
mode=$(printf '%s' "$manifest" | jq -r '.mode // "normal"')
site_sha=$(printf '%s' "$manifest" | jq -r '.siteSha256 // empty')
bundle_sha=$(printf '%s' "$manifest" | jq -r '.bundleSha256 // empty')
[ -n "$commit" ] && [ -n "$site_sha" ] && [ -n "$bundle_sha" ] \
	|| fail "manifest.json incompleto (commit/mode/sha256)"

# --- 2) ¿ya servido? ---
current="$(basename "$(readlink "$DATA/CURRENT" 2>/dev/null || echo '-')")"
if [ "$commit" = "$current" ]; then
	ok "sin cambios (CURRENT=$current)"
	exit 0
fi

# --- 3) descarga + sha256 ---
tmp="$DATA/.update.$commit"
rm -rf "$tmp"; mkdir -p "$tmp"
trap 'rm -rf "$tmp"' EXIT
curl --fail --proto '=https' -fsSL --max-time 120 \
	-o "$tmp/site.tar.gz" "$RELEASE_URL/site.tar.gz" \
	|| fail "no se pudo descargar site.tar.gz"
actual=$(sha256sum "$tmp/site.tar.gz" | cut -d' ' -f1)
[ "$actual" = "$site_sha" ] \
	|| fail "sha256 del tar no cuadra (esperado ${site_sha:0:12}…, recibido ${actual:0:12}…)"

# --- 4) extracción + verificación del bundle ---
mkdir -p "$tmp/extract"
tar -xzf "$tmp/site.tar.gz" -C "$tmp/extract" || fail "el tar no se extrae"
[ -f "$tmp/extract/index.html" ] || fail "el export no tiene index.html"
[ -f "$tmp/extract/datos/elegibilidad/bundle.json" ] \
	|| fail "el export no tiene datos/elegibilidad/bundle.json"
bsum=$(sha256sum "$tmp/extract/datos/elegibilidad/bundle.json" | cut -d' ' -f1)
[ "$bsum" = "$bundle_sha" ] \
	|| fail "sha256 de bundle.json no cuadra (esperado ${bundle_sha:0:12}…)"

# --- 5) puerta strict (misma garantía que release:verify, fail-closed) ---
if [ "$mode" = "strict" ]; then
	jq -e '.rulesets | length > 0 and
		all(.[]; .humanReview.status == "approved")' \
		"$tmp/extract/datos/elegibilidad/bundle.json" >/dev/null \
		|| fail "modo strict pero hay reglas sin humanReview=approved"
fi

mkdir -p "$DATA/releases"
dest="$DATA/releases/$commit"
rm -rf "$dest"
mv "$tmp/extract" "$dest"

# --- 6) switch atómico + comprobación HTTP (rollback a PREVIOUS) ---
previous="$current"
ln -sfn "releases/$commit" "$DATA/CURRENT.new"
mv -T "$DATA/CURRENT.new" "$DATA/CURRENT"
if [ "$previous" != "-" ] && [ -d "$DATA/releases/$previous" ]; then
	ln -sfn "releases/$previous" "$DATA/PREVIOUS.new"
	mv -T "$DATA/PREVIOUS.new" "$DATA/PREVIOUS"
fi

slug=$(jq -r '.items[0].slug // empty' "$dest/datos/elegibilidad/nivel-1.json" 2>/dev/null || true)
sleep 2
http_ok() { curl --proto '=https' -fsS -o /dev/null --max-time 20 -w '%{http_code}' "$1" | grep -q '^200$'; }
served_sha=$(curl --proto '=https' -fsS --max-time 20 \
	"$SITE/datos/elegibilidad/bundle.json" | sha256sum | cut -d' ' -f1 || true)

if ! http_ok "$SITE/" || ! http_ok "$SITE/comprobar/" \
	|| [ -n "$slug" ] && ! http_ok "$SITE/ayudas/$slug/" \
	|| [ "$served_sha" != "$bundle_sha" ]; then
	warn "comprobación HTTP falló tras el switch — volviendo a $previous"
	if [ "$previous" != "-" ]; then
		ln -sfn "releases/$previous" "$DATA/CURRENT.new"
		mv -T "$DATA/CURRENT.new" "$DATA/CURRENT"
	fi
	fail "rollback automático a PREVIOUS ($previous)"
fi

# --- 7) poda: solo CURRENT + PREVIOUS ---
for d in "$DATA"/releases/*/; do
	name=$(basename "$d")
	[ "$name" = "$commit" ] || [ "$name" = "$previous" ] || rm -rf "$d"
done

ok "actualizado: $previous → $commit (modo $mode, bundle ${bundle_sha:0:12}…)"
