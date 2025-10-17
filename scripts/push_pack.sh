#!/usr/bin/env bash
set -euo pipefail

: "${BASE_BRANCH:=main}"
: "${BRANCH:=ops/llm-pack-setup}"

if [[ -z "${GH_PAT:-}" || -z "${OWNER:-}" || -z "${REPO:-}" ]]; then
  echo "ERRO: defina as variáveis GH_PAT, OWNER e REPO e tente novamente."
  exit 1
fi

mask() {
  sed "s/${GH_PAT}/***MASKED***/g"
}

PACK_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "${TMPDIR}"' EXIT

REPO_DIR="${TMPDIR}/${REPO}"
CLONE_URL="https://${GH_PAT}@github.com/${OWNER}/${REPO}.git"

echo "==> Clonando ${OWNER}/${REPO}..." | mask
git clone --quiet "${CLONE_URL}" "${REPO_DIR}" 2>&1 | mask
cd "${REPO_DIR}"
git config user.name "SGI Pack Bot"
git config user.email "automation@sgi-pack.local"

echo "==> Preparando branch '${BRANCH}' a partir de '${BASE_BRANCH}'"
git fetch origin "${BASE_BRANCH}" --quiet
git checkout -B "${BRANCH}" "origin/${BASE_BRANCH}" --quiet || git checkout -b "${BRANCH}"

echo "==> Copiando conteúdo do pack"
mkdir -p ".github/workflows" "docs" "scripts" "env"
cp -f "${PACK_SRC}/.github/workflows/"*.yml ".github/workflows/" 2>/dev/null || true
cp -f "${PACK_SRC}/docs/"*.md "docs/" 2>/dev/null || true
cp -f "${PACK_SRC}/scripts/"*.sh "scripts/" 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true
if [[ -f "${PACK_SRC}/env/.env.example" ]]; then cp -f "${PACK_SRC}/env/.env.example" ".env.example"; fi
if [[ -f "${PACK_SRC}/.gitleaks.toml" ]]; then cp -f "${PACK_SRC}/.gitleaks.toml" ".gitleaks.toml"; fi

echo "==> Commitando mudanças"
git add .github/workflows docs scripts .gitleaks.toml .env.example 2>/dev/null || true
if git diff --cached --quiet; then
  echo "Nenhuma mudança para commitar."
else
  git commit -m "ci: apply SGI Platform Pack v3 (workflows + docs + security)"
fi

echo "==> Fazendo push para '${BRANCH}'"
if [[ "${FORCE_PUSH:-0}" == "1" ]]; then
  git push -f origin "${BRANCH}" 2>&1 | mask
else
  if ! git push origin "${BRANCH}" 2>&1 | mask; then
    echo "Push normal falhou; tente novamente com FORCE_PUSH=1"
    exit 2
  fi
fi

API="https://api.github.com"
AUTH="Authorization: token ${GH_PAT}"
BASE_DATA="?head=${OWNER}:${BRANCH}&base=${BASE_BRANCH}"

echo "==> Checando PR existente"
PR_JSON="$(curl -s -H "${AUTH}" -H "Accept: application/vnd.github+json"   "${API}/repos/${OWNER}/${REPO}/pulls${BASE_DATA}")"
PR_NUMBER="$(echo "${PR_JSON}" | python3 - <<'PY'
import sys, json
try:
    data=json.load(sys.stdin)
    print(data[0]["number"] if isinstance(data, list) and data else "")
except Exception:
    print("")
PY
)"

PR_TITLE="ci: Apply SGI Platform Pack v3 (workflows + docs + security)"
PR_BODY="$(cat "${PACK_SRC}/PR_BODY.md" 2>/dev/null | sed 's/"/\"/g' | tr -d '\r' || echo 'SGI Platform Pack v3')"

if [[ -n "${PR_NUMBER}" ]]; then
  echo "==> Atualizando PR #${PR_NUMBER}"
  curl -s -X PATCH -H "${AUTH}" -H "Accept: application/vnd.github+json"     -d "{"title":"${PR_TITLE}","body":"${PR_BODY}"}"     "${API}/repos/${OWNER}/${REPO}/pulls/${PR_NUMBER}" >/dev/null
  echo "PR atualizado: https://github.com/${OWNER}/${REPO}/pull/${PR_NUMBER}"
else
  echo "==> Criando novo PR"
  CREATE="$(curl -s -X POST -H "${AUTH}" -H "Accept: application/vnd.github+json"     -d "{"title":"${PR_TITLE}","head":"${BRANCH}","base":"${BASE_BRANCH}","body":"${PR_BODY}"}"     "${API}/repos/${OWNER}/${REPO}/pulls")"
  NEW_NUMBER="$(echo "${CREATE}" | python3 - <<'PY'
import sys, json
data=json.load(sys.stdin); print(data.get("number",""))
PY
)"
  if [[ -n "${NEW_NUMBER}" ]]; then
    echo "PR criado: https://github.com/${OWNER}/${REPO}/pull/${NEW_NUMBER}"
  else
    echo "Atenção: não foi possível criar o PR (verifique token e permissões)."
    echo "${CREATE}" | python3 -m json.tool | mask || true
  fi
fi

# Limpar URL do remote (remover token)
git remote set-url origin "https://github.com/${OWNER}/${REPO}.git" || true
echo "==> Concluído."
