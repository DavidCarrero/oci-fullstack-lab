# oci-devops-lab

Laboratorio DevOps: pipeline CI/CD completo con Next.js + NestJS desplegado en
Oracle Cloud Infrastructure usando tres modelos simultáneamente (VM, Container
Instance, Kubernetes).

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-org/oci-devops-lab.git
cd oci-devops-lab
npm install        # Instala deps del root + workspaces + configura Husky
```

### 2. Desarrollo local

```bash
# Backend (puerto 3000)
cd apps/backend && npm run start:dev

# Frontend (puerto 3001)
cd apps/frontend && npm run dev

# O con Docker Compose (ambos)
docker compose up --build
```

### 3. Verificar que funciona

```bash
curl http://localhost:3000/health   # Backend health
curl http://localhost:3001           # Frontend
```

## Estructura del proyecto

```
oci-devops-lab/
├── apps/frontend/         → Next.js (SSR, puerto 3001)
├── apps/backend/          → NestJS (API, puerto 3000)
├── infra/k8s/             → Manifiestos K8s con Kustomize
├── infra/terraform/       → IaC para OCI
├── .github/workflows/     → CI/CD (3 workflows)
├── .husky/                → Git hooks
├── scripts/               → Validaciones
├── docker-compose.yml     → Dev local / deploy VM
└── sonar-project.properties
```

## Pipeline completo

| Etapa | Trigger | Qué hace |
|-------|---------|----------|
| Pre-commit | `git commit` | ESLint + Prettier (solo archivos staged) |
| Pre-push | `git push` | Tests unitarios + validar archivos obligatorios |
| CI Push | Push a feature branch | Lint + tests + build (red de seguridad) |
| CI PR | PR hacia main | Todo + SonarQube + AI Review + e2e |
| CD Deploy | Merge a main | Build images → OCIR → deploy a VM + CI + OKE |

## Despliegue a OCI

### Prerequisitos

1. Cuenta OCI con tenancy configurado
2. OCIR habilitado en `sa-bogota-1`
3. Auth token generado para Docker login
4. Para VM: instancia Compute con Docker instalado
5. Para OKE: cluster creado (Basic, gratuito)
6. Secrets configurados en GitHub (ver `docs/ARCHITECTURE.md`)

### Infraestructura con Terraform

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores reales

terraform init
terraform plan
terraform apply
```

### Deploy manual (para pruebas)

```bash
# Login a OCIR
docker login sa-bogota-1.ocir.io -u TENANCY/EMAIL

# Build y push
docker build -t sa-bogota-1.ocir.io/TENANCY/backend:latest apps/backend/
docker push sa-bogota-1.ocir.io/TENANCY/backend:latest

# Deploy a K8s
cd infra/k8s/overlays/staging
kustomize build . | kubectl apply -f -
```

## Documentación

- [Arquitectura detallada](docs/ARCHITECTURE.md)
- [Frontend README](apps/frontend/README.md)
- [Backend README](apps/backend/README.md)
- [Changelog](CHANGELOG.md)
