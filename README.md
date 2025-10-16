
# SGI Platform

Sistema de Gestão Integrada - Plataforma completa com frontend Next.js, backend NestJS e infraestrutura Docker/Traefik.

## 🏗️ Arquitetura

- **Frontend**: Next.js 14+ com TypeScript
- **Backend**: NestJS com TypeScript
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Reverse Proxy**: Traefik v2.10
- **Containerização**: Docker & Docker Compose

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

4. Configure autenticação do Traefik Dashboard:
```bash
# Gere hash de senha
echo $(htpasswd -nb admin sua_senha) | sed -e s/\\$/\\$\\$/g
# Cole o resultado em TRAEFIK_DASHBOARD_AUTH no .env
```

5. Inicie os serviços:
```bash
docker-compose up -d
```

6. Verifique os logs:
```bash
docker-compose logs -f
```

## 📦 Estrutura do Projeto

```
sgi-platform/
├── frontend/              # Aplicação Next.js
│   ├── Dockerfile
│   └── ...
├── backend/               # API NestJS
│   ├── Dockerfile
│   └── ...
├── docs/                  # Documentação
│   └── SECURITY/         # Documentação de segurança
├── scripts/              # Scripts de automação
│   ├── branch_protection.sh
│   ├── rotate_jwt.sh
│   └── run_gitleaks.sh
├── patches/              # Patches de configuração
├── .github/              # GitHub Actions workflows
├── docker-compose.yml    # Orquestração de containers
├── .env.example         # Template de variáveis de ambiente
└── README.md

```

## 🔒 Segurança

Este projeto implementa múltiplas camadas de segurança:

- ✅ Secret scanning com Gitleaks
- ✅ Dependabot alerts habilitado
- ✅ Branch protection rules
- ✅ HTTPS obrigatório via Traefik
- ✅ Security headers (HSTS, CSP, etc)
- ✅ Rate limiting no backend
- ✅ JWT com rotação de secrets
- ✅ Autenticação de dois fatores (opcional)

Consulte [SECURITY.md](SECURITY.md) para mais detalhes.

## 🛠️ Desenvolvimento

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Frontend
cd frontend
pnpm dev

# Backend
cd backend
pnpm start:dev
```

### Executar Testes

```bash
# Frontend
cd frontend
pnpm test

# Backend
cd backend
pnpm test
```

### Build de Produção

```bash
# Build de todos os serviços
docker-compose build

# Build individual
docker-compose build frontend
docker-compose build backend
```

## 🔧 Scripts Úteis

```bash
# Rodar scan de secrets
./scripts/run_gitleaks.sh

# Aplicar branch protection
./scripts/branch_protection.sh

# Rotacionar JWT secret
./scripts/rotate_jwt.sh
```

## 📊 Monitoramento

- **Traefik Dashboard**: https://traefik.seu-dominio.com
- **API Health**: https://api.seu-dominio.com/health
- **Frontend**: https://seu-dominio.com

## 🔄 CI/CD

O projeto utiliza GitHub Actions para:

- ✅ Build automático em PRs
- ✅ Testes automatizados
- ✅ Lint e formatação
- ✅ Security scanning

## 📝 Variáveis de Ambiente

Consulte [.env.example](.env.example) para lista completa de variáveis configuráveis.

### Variáveis Obrigatórias

- `DOMAIN`: Domínio principal
- `POSTGRES_PASSWORD`: Senha do PostgreSQL
- `REDIS_PASSWORD`: Senha do Redis
- `JWT_SECRET`: Secret para tokens JWT
- `NEXTAUTH_SECRET`: Secret para NextAuth

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário da ParanhosSistema.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

---

**Nota**: Este é um projeto em produção. Sempre revise as mudanças antes de fazer deploy.
