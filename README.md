# CLAVIS VIA

Aplicação de acolhimento emocional com check-in de humor, recomendações e planos guiados. O projeto foi desenvolvido como desafio técnico e entrega um fluxo completo: cadastro, login com JWT, onboarding, registro de humor, acompanhamento de planos e histórico da jornada.

## Aplicação publicada

- Frontend: [clavis-via.vmanoel-silva.workers.dev](https://clavis-via.vmanoel-silva.workers.dev)
- API: [clavis-via-api.onrender.com](https://clavis-via-api.onrender.com)
- Swagger: [clavis-via-api.onrender.com/docs](https://clavis-via-api.onrender.com/docs)

#### O backend usa o plano gratuito do Render e pode levar alguns segundos para iniciar após um período sem uso. O frontend exibe uma tela de espera enquanto consulta `/health`.

## Conta de demonstração

```text
E-mail: demo.clavisvia@example.com
Senha: ClavisViaDemo2026!
```

Essa é uma conta pública, criada somente com dados fictícios. Não informe nela dados pessoais ou sensíveis.

## Funcionalidades

- cadastro e login por e-mail e senha;
- autenticação e proteção de rotas com JWT;
- onboarding para novos usuários;
- check-in de humor com observação opcional;
- recomendação de conteúdo conforme o humor selecionado;
- planos guiados organizados por dias;
- registro de reflexão e conclusão de atividades;
- jornada com histórico individual;
- logout e recuperação dos dados do usuário pela API;
- documentação interativa da API em `/docs`.

> O CLAVIS VIA não substitui acompanhamento médico, psicológico ou atendimento de emergência.

## Arquitetura

```text
React + TanStack Start (Cloudflare Workers)
                    |
               HTTPS + JWT
                    |
          FastAPI (Render)
                    |
          SQLAlchemy + Alembic
                    |
       PostgreSQL (Supabase)
```

O navegador não acessa o banco diretamente. Autenticação, autorização e persistência passam pela API FastAPI. Os dados privados são sempre consultados usando o usuário identificado pelo token.

## Tecnologias

- Frontend: React 19, TypeScript, TanStack Start/Router/Query, Tailwind CSS e shadcn/ui.
- Backend: FastAPI, SQLAlchemy, Alembic, PyJWT e pwdlib/Argon2.
- Banco: PostgreSQL hospedado no Supabase.
- Deploy: Cloudflare Workers para o frontend e Render para a API.
- Testes: Vitest e Testing Library.

## Estrutura

```text
backend/                 API, modelos e migrations Alembic
frontend/                aplicação React e testes
render.yaml              configuração do serviço no Render
DEPLOY.md                instruções de publicação
README.md                visão geral e execução local
```

## Executando localmente

### Backend

Requer Python 3.12+ e PostgreSQL.

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Preencha `DATABASE_URL` e `JWT_SECRET_KEY` no `.env`. Depois execute:

```bash
alembic upgrade head
python run.py
```

A API ficará disponível em `http://127.0.0.1:3001`.

### Frontend

Requer Node.js 20+.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Por padrão, `VITE_API_URL` aponta para `http://127.0.0.1:3001`.

## Variáveis de ambiente

Backend:

- `DATABASE_URL`: conexão PostgreSQL;
- `JWT_SECRET_KEY`: segredo usado na assinatura dos tokens;
- `JWT_ALGORITHM`: algoritmo JWT, por padrão `HS256`;
- `JWT_EXPIRE_MINUTES`: duração do token em minutos;
- `FRONTEND_URLS`: origens permitidas pelo CORS, separadas por vírgula;
- `ENVIRONMENT`: ambiente da aplicação.

Frontend:

- `VITE_API_URL`: endereço público da API, sem barra no final.

Os arquivos `.env` reais são ignorados pelo Git. Apenas os modelos `.env.example` devem ser versionados.

## Banco e migrations

O Alembic é a fonte de verdade do esquema. A migration inicial cria usuários, planos, dias, check-ins e conclusões, além de inserir o conteúdo-base. Para atualizar um banco:

```bash
cd backend
alembic upgrade head
```

## Qualidade

```bash
cd frontend
npm test
npm run lint
npm run build
```

Para validar o backend:

```bash
cd backend
python -m compileall src alembic
alembic current
```

Consulte também [as decisões técnicas](frontend/DECISOES.md) e [o guia de deploy](DEPLOY.md).
