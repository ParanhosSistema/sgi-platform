# SGI Platform - MVP de Login

Este pacote adiciona **backend NestJS** e **frontend Next.js** mínimos para permitir **login imediato** usando as variáveis já existentes no `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET` (expiração: `JWT_EXPIRES_IN`)

## Como usar (local)

### Sem Docker
1. Backend
   ```bash
   cd backend
   pnpm install || npm install
   pnpm start:dev || npx tsx watch src/main.ts
   ```
   A API sobe em `http://localhost:3001`

2. Frontend
   ```bash
   cd frontend
   pnpm install || npm install
   pnpm dev
   ```
   App em `http://localhost:3000`

### Com Docker Compose (override local)
Certifique-se de ter `docker-compose.override.yml` habilitando portas locais e desabilitando Traefik:

```yaml
version: "3.9"
services:
  traefik:
    profiles: ["off"]
  frontend:
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
      - NEXTAUTH_URL=http://localhost:3000
    depends_on: [backend]
  backend:
    ports: ["3001:3001"]
    environment:
      - API_PORT=3001
      - CORS_ORIGIN=http://localhost:3000
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
```

Subir:
```bash
docker compose build
docker compose up -d
```

## Endpoints
- `GET /health` — status básico
- `POST /auth/login` → body: `{ "email": "...", "password": "..." }`

## Importante
- **Não** committe `.env`.
- Rotacione `ADMIN_PASSWORD` após primeiro acesso.
- Em produção, remova o `override`, configure Traefik/HTTPS e domínios reais.
