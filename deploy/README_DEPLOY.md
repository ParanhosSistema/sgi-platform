# Deploy Rápido — SGI Platform

## 1) VPS com Docker + Traefik
Pré-requisitos:
- DNS apontado para a VPS: paranhospr.com.br, api.paranhospr.com.br, portal.brandin.com.br, n8n.brandin.com.br

### Passos
1. Crie `.env` a partir de `.env.example` ou `.env.prod.example`.
2. Suba:
   ```bash
   docker compose pull
   docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
   docker compose ps
   ```
Verifique:
- https://paranhospr.com.br
- https://api.paranhospr.com.br/health
- https://portal.brandin.com.br
- https://n8n.brandin.com.br

## 2) Grafana Provisioning (opcional)
- `grafana-provisioning/datasources/prometheus.yml`
- `grafana-provisioning/dashboards/slo-overview.json`

## 3) Render.com (opcional)
- Use `render.yaml` como blueprint e configure domínios customizados.

## Observações
- Ajuste senhas/segredos.
- Revise firewall, backups do Postgres e monitoramento.
