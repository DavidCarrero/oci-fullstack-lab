# Arquitectura

## Estructura del monorepo

```
oci-devops-lab/
├── apps/
│   ├── frontend/          # Next.js (puerto 3001)
│   └── backend/           # NestJS  (puerto 3000)
├── infra/
│   ├── k8s/
│   │   ├── base/          # Manifiestos base (Kustomize)
│   │   └── overlays/      # Patches por ambiente (staging, production)
│   └── terraform/         # IaC para OCI (VM, Container Instance, OKE)
├── .github/workflows/     # CI/CD pipelines
├── .husky/                # Git hooks (pre-commit, pre-push)
├── scripts/               # Scripts de validación
├── docker-compose.yml     # Dev local y despliegue VM
└── sonar-project.properties
```

## Modelos de despliegue en OCI

### Modelo 1: VM con Docker Compose
La VM (Ampere A1 Flex) corre Docker y Docker Compose. El CD se conecta por
SSH, hace pull de las imágenes desde OCIR, y ejecuta `docker compose up`.
Es el modelo más simple y barato (Always Free eligible).

### Modelo 2: OCI Container Instances
Contenedor serverless sin orquestador. Se define el shape, la imagen, y OCI
la corre directamente. Mismo pricing que Compute, sin cargos adicionales.
No tiene autoscaling nativo — para eso se necesita K8s.

### Modelo 3: OKE (Kubernetes)
Cluster managed con control plane gratuito (Basic). Los manifiestos usan
Kustomize con base compartida y overlays por ambiente. El CD aplica los
manifiestos con `kustomize build | kubectl apply`.

## Pipeline CI/CD

```
Local (Husky)           GitHub Actions              OCI
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ pre-commit   │    │ push → ci-push   │    │ VM (Compose)    │
│  lint-staged │    │ PR   → ci-pr     │    │ Container Inst. │
│ pre-push     │───▶│  + SonarQube     │───▶│ OKE (K8s)       │
│  tests       │    │  + AI Review     │    │                 │
│  file check  │    │ main → cd-deploy │    │                 │
└─────────────┘    └──────────────────┘    └─────────────────┘
```

## Secrets necesarios en GitHub

| Secret | Descripción |
|--------|-------------|
| `OCI_TENANCY` | Namespace de OCIR (ej: `ax9kokncwtdj/dcarrero`) |
| `OCI_USERNAME` | Email de OCI para login a OCIR |
| `OCI_AUTH_TOKEN` | Auth token generado en OCI |
| `OCI_USER_OCID` | OCID del usuario |
| `OCI_TENANCY_OCID` | OCID del tenancy |
| `OCI_FINGERPRINT` | Fingerprint de la API key |
| `OCI_KEY_CONTENT` | Contenido de la private key PEM |
| `VM_PUBLIC_IP` | IP pública de la VM |
| `VM_SSH_KEY` | Llave SSH privada para la VM |
| `OKE_CLUSTER_ID` | OCID del cluster OKE |
| `OCI_CI_BACKEND_ID` | OCID del Container Instance |
| `ANTHROPIC_API_KEY` | API key de Claude (opcional) |
| `SONAR_TOKEN` | Token de SonarCloud (opcional) |
