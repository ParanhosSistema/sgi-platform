# SGI Platform Pack v3 — Workflows + Docs + Security

Este pack instala uma base de CI/CD segura no repositório:

- ✅ CI completo (backend e frontend)
- ✅ Security (Gitleaks)
- ✅ Deploy para runner self-hosted
- ✅ Documentação operacional
- ✅ Script automático de aplicação com criação/atualização de PR

## Como aplicar (resumo)
1. Defina variáveis de ambiente: `GH_PAT`, `OWNER`, `REPO`
2. Execute: `bash pack/scripts/push_pack.sh`
3. Abra o PR criado/atualizado e faça o merge
4. Configure os *secrets* (docs/INSTRUCOES_SECRETS.md)
5. (Opcional) Configure o runner self-hosted (docs/INSTRUCOES_RUNNER.md)
