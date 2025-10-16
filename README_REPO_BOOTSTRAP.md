
# SGI Platform — Repo Bootstrap & Hardening
Conteúdo: .gitignore, .env.example, SECURITY.md, docs/SECURITY/*, CI (GitHub Actions), scripts e patches.
Uso rápido:
1) Criar repo privado `sgi-platform` (ex.: owner ParanhosSistema) e conceder acesso ao GitHub App.
2) Extrair este pacote na raiz do projeto (`/opt/sgi-platform`) e fazer commit **sem segredos**.
3) Aplicar branch protection, rodar gitleaks, abrir PRs de segurança.
