# TROUBLESHOOTING

- **403 em GitHub Actions API**: confira permissões do token/app e `workflow` scope.
- **Push rejeitado (non-fast-forward)**: habilite `FORCE_PUSH=1` antes de rodar o script.
- **Gitleaks acusando falso positivo**: ajuste `allowlist` ou regras no `.gitleaks.toml`.
- **Deploy falha no healthcheck**: verifique porta/URL do serviço e logs do container.
