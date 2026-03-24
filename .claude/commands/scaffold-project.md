Crea la estructura completa de un proyecto fullstack DevOps en el directorio actual. El proyecto debe seguir el mismo estandar que `oci-fullstack-lab`.

## Lo que debes crear

### 1. Archivos raiz

**`package.json`** — workspace monorepo con scripts: `lint`, `test`, `test:cov`, `build`, `prepare`
Incluye devDependencies: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`
Incluye `lint-staged` config para `.ts,.tsx` y `.json,.md,.css`

**`commitlint.config.js`** — extiende `@commitlint/config-conventional` con tipos:
`feat, fix, docs, style, refactor, test, chore, build, ci, perf, revert`
Reglas: `type-case: lower-case`, `subject-case: lower-case`, `subject-empty: never`, `header-max-length: 100`

**`README.md`** — documentacion del proyecto con secciones: descripcion, arquitectura, stack, setup local, scripts, estructura de ramas, conventional commits

**`CHANGELOG.md`** — archivo vacio con header: `# Changelog`

**`.gitignore`** — node_modules, dist, .next, .env*, coverage, *.log

**`docker-compose.yml`** — servicios frontend (puerto 3000) y backend (puerto 3001) con variables de entorno

**`sonar-project.properties`** — configuracion basica de SonarQube

### 2. Husky + Git hooks

Inicializa husky con `npx husky init` y crea estos hooks en `.husky/`:

**`pre-commit`**:
```sh
#!/bin/sh
npx lint-staged
```

**`commit-msg`**:
```sh
#!/bin/sh
npx --no -- commitlint --edit $1
```

**`pre-push`**:
```sh
#!/bin/sh
# Valida nombre de rama (git flow)
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
VALID_PATTERN="^(main|develop|feature\/.+|bugfix\/.+|hotfix\/.+|release\/.+|chore\/.+|docs\/.+|ci\/.+)$"
if [ -n "$BRANCH" ] && ! echo "$BRANCH" | grep -qE "$VALID_PATTERN"; then
  echo "Push bloqueado: la rama '$BRANCH' no sigue git flow"
  exit 1
fi
bash scripts/validate-files.sh
npm run test --workspaces --if-present
```

### 3. Scripts

**`scripts/validate-files.sh`** — valida que existan archivos obligatorios:
`CHANGELOG.md, README.md, docs/ARCHITECTURE.md, apps/frontend/README.md, apps/frontend/Dockerfile, apps/backend/README.md, apps/backend/Dockerfile, docker-compose.yml`

### 4. GitHub Actions (`.github/workflows/`)

**`ci-pr.yml`** — trigger: `pull_request` a `main` y `develop`
Jobs: lint, test, build (en ese orden con `needs`)

**`ci-push.yml`** — trigger: `push` a `main` y `develop`
Jobs: validate-files, test, build

**`cd-deploy.yml`** — trigger: `push` a `main`
Jobs: build-and-push Docker images, deploy (placeholder)

### 5. Apps

**`apps/frontend/`** — Next.js 14 con TypeScript
- `package.json` con scripts: `dev, build, start, lint, test, test:cov`
- `Dockerfile` multi-stage (builder + runner)
- `.dockerignore`
- `README.md`
- `.eslintrc.json` — extiende `next/core-web-vitals`, `@typescript-eslint/recommended`, `prettier`
- `.prettierrc` — `singleQuote: true, trailingComma: all, printWidth: 100, endOfLine: lf`
- `src/app/layout.tsx` con import de `globals.css`
- `src/app/globals.css` con reset basico y estilos del body
- `src/app/page.tsx` — pagina principal con health check reactivo (usar `'use client'`)
- `src/app/page.module.css` — estilos con CSS Modules (sin selectores globales)
- `__tests__/page.test.tsx` — tests con @testing-library/react
- `__mocks__/styleMock.js` — mock de CSS modules para jest
- `jest.config.js` — con `tsconfig.jest.json` y `moduleNameMapper` para CSS
- `tsconfig.jest.json` — extiende tsconfig con `module: commonjs, jsx: react-jsx`

**`apps/backend/`** — NestJS con TypeScript
- `package.json` con scripts: `build, start, start:dev, start:prod, lint, test, test:cov, test:e2e`
- `Dockerfile` multi-stage
- `.dockerignore`
- `README.md`
- `.eslintrc.js` — `@typescript-eslint/recommended` + `prettier/recommended`
- `.prettierrc` — mismas reglas que frontend
- `nest-cli.json`
- `src/main.ts` — bootstrap con CORS y PORT configurable
- `src/app/app.module.ts, app.controller.ts, app.service.ts`
- `src/health/health.controller.ts` — GET /health con `{status, uptime, timestamp}`
- `src/health/health.module.ts`
- Tests: `*.spec.ts` para controller y service
- `test/app.e2e-spec.ts` con supertest

### 6. Docs

**`docs/ARCHITECTURE.md`** — diagrama de arquitectura en texto, descripcion de componentes, flujo CI/CD, estructura de ramas

### 7. Infra

**`infra/k8s/base/`** — manifiestos Kubernetes: namespace, deployment y service para frontend y backend, kustomization.yml
**`infra/k8s/overlays/staging/`** y **`production/`** — kustomization.yml con patches
**`infra/terraform/main.tf`** — recursos basicos de OCI (o proveedor generico)
**`infra/terraform/terraform.tfvars.example`** — variables de ejemplo

### 8. Inicializacion final

Ejecuta en orden:
1. `npm install` en la raiz
2. `npm run prepare` — inicializa husky
3. `git init` si no existe repo
4. `git add .`
5. Crea el primer commit: `chore: initial project scaffold`

## Notas importantes

- Todos los archivos `.sh` deben tener permisos de ejecucion (`chmod +x`)
- El frontend usa CSS Modules — ningun selector global en `.module.css`
- El backend corre en puerto 3001 por defecto (`PORT=3001`)
- Los hooks de husky deben comenzar con `#!/bin/sh`
- La variable de entorno del frontend para el backend es `NEXT_PUBLIC_API_URL`
