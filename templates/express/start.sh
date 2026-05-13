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

COMPOSE_FILE="docker-compose.yml"
if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "[ERROR] Arquivo $COMPOSE_FILE nao encontrado."
  exit 1
fi

if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
  echo "[INFO] .env criado a partir de .env.example"
fi

echo "[0/4] Validando compose..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" config >/dev/null

echo "[1/4] Parando e removendo versao antiga..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" down --remove-orphans

echo "[2/4] Buildando nova versao..."
if [[ "${FORCE_PULL:-0}" == "1" ]]; then
  echo "[INFO] FORCE_PULL=1, tentando atualizar imagens base do registry..."
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" build --pull
else
  echo "[INFO] Build offline-friendly (sem --pull). Para forcar pull: FORCE_PULL=1 ./start.sh"
  "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" build
fi

echo "[3/4] Subindo servicos (app + postgres + redis)..."
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" up -d --force-recreate

echo "[4/4] Estado dos servicos:"
"${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" ps

echo "[OK] Stack Express atualizada e em execucao."
