#!/bin/bash
# Valida que existan los archivos obligatorios del proyecto
# Usado por: .husky/pre-push y .github/workflows/ci-push.yml

MISSING=()
REQUIRED_FILES=(
  "CHANGELOG.md"
  "README.md"
  "docs/ARCHITECTURE.md"
  "apps/frontend/README.md"
  "apps/frontend/Dockerfile"
  "apps/backend/README.md"
  "apps/backend/Dockerfile"
  "docker-compose.yml"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    MISSING+=("$f")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ Archivos obligatorios faltantes:"
  printf '  - %s\n' "${MISSING[@]}"
  exit 1
fi

echo "✅ Todos los archivos obligatorios presentes"
exit 0
