# Frontend - Next.js

Aplicación frontend del laboratorio OCI DevOps.

## Desarrollo local

```bash
npm install
npm run dev     # http://localhost:3001
```

## Variables de entorno

| Variable              | Descripción         | Default                 |
| --------------------- | ------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | URL del backend API | `http://localhost:3000` |

## Docker

```bash
docker build -t frontend .
docker run -p 3001:3001 frontend
```
