#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$PROJECT_DIR/autodeploy.log"
INTERVAL=60

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Auto-deploy iniciado para golabz ==="

cd "$PROJECT_DIR" || { log "ERRO: não foi possível entrar em $PROJECT_DIR"; exit 1; }

while true; do
  git fetch origin 2>/dev/null

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse @{u} 2>/dev/null)

  if [ "$LOCAL" != "$REMOTE" ]; then
    log "Mudanças detectadas. Atualizando..."

    # Captura migrations novas/alteradas antes do pull
    NEW_MIGRATIONS=$(git diff "$LOCAL".."$REMOTE" --name-only -- src/migrations/ 2>/dev/null)

    git pull origin "$(git branch --show-current)" >> "$LOG_FILE" 2>&1

    log "Rebuilding e reiniciando containers golabz..."
    docker compose down >> "$LOG_FILE" 2>&1
    docker compose build --no-cache >> "$LOG_FILE" 2>&1
    docker compose up -d >> "$LOG_FILE" 2>&1

    if docker ps --filter "name=golabz-api" --filter "status=running" | grep -q golabz-api; then
      log "Container golabz-api reiniciado com sucesso."

      if [ -n "$NEW_MIGRATIONS" ]; then
        log "Migrations detectadas. Aguardando API inicializar..."
        sleep 15
        for migration in $NEW_MIGRATIONS; do
          log "Executando migration: $migration"
          docker exec golabz-api node "$migration" >> "$LOG_FILE" 2>&1
          if [ $? -eq 0 ]; then
            log "✅ Migration $migration concluída."
          else
            log "❌ ERRO na migration $migration."
          fi
        done
      fi
    else
      log "ERRO: container golabz-api não está rodando após restart."
    fi
  fi

  sleep "$INTERVAL"
done
