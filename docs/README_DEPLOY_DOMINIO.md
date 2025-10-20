# README_DEPLOY_DOMINIO.md
Use este guia para apontar **paranhospr.com.br** para o frontend no Render.

1) No Render → serviço **sgi-platform-frontend** → Settings → Custom Domains → **+ Add** `paranhospr.com.br`.
2) O Render exibirá os registros DNS necessários (A/ALIAS para o apex e CNAME para `www`). Copie exatamente os valores mostrados na tela do Render.
3) No seu provedor de DNS/registrar (ex.: Registro.br, Cloudflare, GoDaddy):
   - **Apex (raiz)** `paranhospr.com.br` → A records (endereços IP fornecidos pelo Render).
   - **www.paranhospr.com.br** → CNAME apontando para o subdomínio do Render do frontend.
4) Salve as alterações e volte ao Render para clicar em **Verify** no domínio até ficar **Verified**.
5) Atualize no Render a variável `NEXTAUTH_URL` do frontend para `https://paranhospr.com.br` e redeploy.
