# INSTRUCOES_SECRETS.md

Configure no GitHub > Settings > Secrets and variables > Actions:

Obrigatórios:
- `DATABASE_URL` — conexão PostgreSQL (pool)
- `DIRECT_URL` — conexão direta (migrations)
- `JWT_SECRET` — chave JWT (>= 64 chars)
- `ADMIN_EMAIL` — e-mail do admin
- `ADMIN_PASSWORD` — senha do admin

Opcionais:
- `RENDER_DEPLOY_HOOK` — webhook de deploy
