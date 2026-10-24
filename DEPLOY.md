# Deploy gratuito

Esta configuração publica o backend no Render, o frontend no Cloudflare Workers e mantém o PostgreSQL no Supabase.

## 1. Backend no Render

1. Envie este repositório para o GitHub.
2. No Render, crie um **Blueprint** usando o `render.yaml` da raiz.
3. Informe `DATABASE_URL` usando a string de conexão do Supabase.
4. Informe inicialmente `FRONTEND_URLS` com uma URL HTTPS provisória. Ela será substituída pela URL do Worker no passo 3.
5. Aguarde o build. Ele instala as dependências, executa `alembic upgrade head` e inicia o FastAPI.
6. Confira `https://SEU-SERVICO.onrender.com/health` e `https://SEU-SERVICO.onrender.com/docs`.

O Render gera `JWT_SECRET_KEY` automaticamente. Não copie esse valor para o repositório.

## 2. Frontend no Cloudflare Workers

No terminal:

```bash
cd frontend
npx wrangler login
VITE_API_URL=https://SEU-SERVICO.onrender.com npm run deploy
```

O comando recusa URLs locais ou sem HTTPS para evitar publicar um frontend apontando para `localhost`.

## 3. CORS definitivo

1. Copie a URL `https://clavis-via.<sua-conta>.workers.dev` gerada pelo Cloudflare.
2. No Render, altere `FRONTEND_URLS` para essa URL, sem barra no final.
3. Salve e faça um novo deploy do backend.
4. Teste cadastro, login, check-in e logout pelo endereço público.

Para permitir mais de um domínio, separe as URLs por vírgula:

```text
https://clavis-via.exemplo.workers.dev,https://app.seudominio.com
```

## Variáveis

### Render

- `DATABASE_URL`: conexão PostgreSQL do Supabase, mantida como segredo.
- `JWT_SECRET_KEY`: gerada automaticamente pelo Blueprint.
- `FRONTEND_URLS`: origens HTTPS autorizadas no CORS.
- `JWT_ALGORITHM`: `HS256`.
- `JWT_EXPIRE_MINUTES`: `60`.
- `ENVIRONMENT`: `production`.

### Cloudflare

- `VITE_API_URL`: URL pública HTTPS do backend no Render; é incorporada ao bundle durante o build.
