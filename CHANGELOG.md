# Changelog

Todos los cambios notables del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [1.0.0] - 2026-03-23

### Agregado
- Monorepo inicial con Next.js (frontend) y NestJS (backend)
- Dockerfiles multi-stage para ambos servicios
- Docker Compose para desarrollo local y despliegue en VM
- Manifiestos Kubernetes con Kustomize (base + overlays staging/production)
- Terraform para OCI: VM (A1 Flex), Container Instances, OKE
- GitHub Actions: CI en push, CI completo en PR, CD a OCI (3 modelos)
- Husky hooks: pre-commit (lint-staged), pre-push (tests + file validation)
- Script de validación de archivos obligatorios
- Configuración de SonarQube para análisis de calidad
- AI Code Review con Claude API en PRs
- Health check endpoints en backend (/health)
- Tests unitarios para controllers y servicios
