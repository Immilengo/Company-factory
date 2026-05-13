#!/usr/bin/env bash
set -euo pipefail

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] Docker nao encontrado no PATH."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "[ERROR] Docker Compose nao encontrado (docker compose ou docker-compose)."
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-}"
if [[ -n "$COMPOSE_FILE" ]]; then
  if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "[ERROR] Arquivo informado em COMPOSE_FILE nao existe: $COMPOSE_FILE"
    exit 1
  fi
  COMPOSE_ARGS=(-f "$COMPOSE_FILE")
else
  COMPOSE_ARGS=()
  if [[ ! -f "docker-compose.yml" && ! -f "docker-compose.yaml" && ! -f "compose.yml" && ! -f "compose.yaml" ]]; then
    echo "[ERROR] Nenhum arquivo compose encontrado no diretorio atual."
    echo "        Defina COMPOSE_FILE=/caminho/compose.yml para usar o compose corporativo."
    exit 1
  fi
fi

if [[ ! -f ".env" ]]; then
  echo "[WARN] Arquivo .env nao encontrado. O compose usara defaults e variaveis do ambiente do sistema."
fi

echo "[0/3] Validando sintaxe do compose..."
"${COMPOSE_CMD[@]}" "${COMPOSE_ARGS[@]}" config >/dev/null

echo "[1/3] Parando e removendo containers atuais..."
"${COMPOSE_CMD[@]}" "${COMPOSE_ARGS[@]}" down --remove-orphans

echo "[2/3] Buildando imagens atualizadas..."
"${COMPOSE_CMD[@]}" "${COMPOSE_ARGS[@]}" build --pull

echo "[3/3] Subindo containers novos..."
"${COMPOSE_CMD[@]}" "${COMPOSE_ARGS[@]}" up -d --force-recreate

echo "[OK] Servicos atualizados e em execucao."
"${COMPOSE_CMD[@]}" "${COMPOSE_ARGS[@]}" ps
