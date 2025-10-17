# INSTRUCOES_RUNNER.md

Para usar o workflow de deploy, instale um runner self-hosted:

1. Acesse *Settings > Actions > Runners > New self-hosted runner*
2. Escolha Linux x64 e siga os comandos exibidos
3. Adicione labels: `linux`, `self-hosted`, `vps`, `prod`
4. Garanta que o host tem Docker e Docker Compose
5. Teste o workflow `Deploy (Self-Hosted Runner)` via *workflow_dispatch*
