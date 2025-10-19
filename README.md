
# SGI Platform

Sistema de Gestão Integrada - Plataforma completa com frontend Next.js, backend NestJS e infraestrutura Docker/Traefik.

## 🏗️ Arquitetura

- **Frontend**: Next.js 14+ com TypeScript
- **Backend**: NestJS com TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Reverse Proxy**: Traefik v2.10
- **Containerização**: Docker & Docker Compose

## 📁 Estrutura do Repositório

```
sgi-platform/
├── deploy/              # Configurações de deploy (Docker Compose, Traefik, Grafana)
│   ├── docker-compose.yml
│   ├── docker-compose.override.yml
│   ├── traefik-dynamic/
│   ├── grafana-provisioning/
│   └── README_DEPLOY.md
├── docs/                # Documentação de arquitetura
│   ├── blueprint_sgi_platform.yaml
│   └── README_PACOTE_ARQUITETURA.md
├── backend/             # API NestJS
├── frontend/            # Web Next.js
└── README.md           # Este arquivo
```

## 🚀 Quick Start

### Pré-requisitos

- Docker 24+
- Docker Compose v2+
- Node.js 20+ (para desenvolvimento local)
- pnpm 9+ (para desenvolvimento local)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ParanhosSistema/sgi-platform.git
cd sgi-platform
```

2. Configure as variáveis de ambiente:
```bash
cd deploy
cp .env.example .env
# Edite .env com seus valores reais
```

3. Gere secrets fortes:
```bash
# JWT Secret
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32

# Session Secret
openssl rand -base64 32
```

4. Suba os containers:
```bash
cd deploy
docker compose up -d
```

## 🗺️ Projeto de Mapas

✅ **SIM**, o projeto de mapas dos **Municípios do Paraná** está incorporado no SGI Platform como parte integrante do sistema.

## 📚 Documentação

- [Guia de Deploy](deploy/README_DEPLOY.md) - Instruções completas de deploy
- [Arquitetura](docs/README_PACOTE_ARQUITETURA.md) - Blueprint e documentação técnica

## 🔒 Segurança

- Traefik com SSL automático (Let's Encrypt)
- Headers de segurança configurados (HSTS, CSP, etc.)
- Secrets gerenciados via variáveis de ambiente
- Healthchecks em todos os serviços

## 📊 Observabilidade

- Grafana + Prometheus pré-configurados
- Dashboards de SLO incluídos
- Métricas de todos os serviços

## 📝 Licença

Proprietary - ParanhosSistema
