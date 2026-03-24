# Backend - NestJS

API backend del laboratorio OCI DevOps.

## Endpoints

| Ruta      | Método | Descripción       |
| --------- | ------ | ----------------- |
| `/`       | GET    | Info del proyecto |
| `/health` | GET    | Health check      |

## Desarrollo local

```bash
npm install
npm run start:dev   # http://localhost:3000
```

## Tests

```bash
npm run test        # Unitarios
npm run test:e2e    # Integración
npm run test:cov    # Cobertura
```

## Docker

```bash
docker build -t backend .
docker run -p 3000:3000 backend
```
