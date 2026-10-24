# Decisões técnicas

## 1. Arquitetura

O frontend usa React com TanStack Start e é publicado no Cloudflare Workers. Ele se comunica somente com a API FastAPI hospedada no Render. O backend concentra autenticação, autorização, validação e acesso ao PostgreSQL do Supabase por meio do SQLAlchemy.

Essa separação impede que credenciais ou regras de acesso ao banco fiquem no navegador. TanStack Query administra carregamento, cache e erros no frontend, enquanto regras puras de apresentação permanecem em `src/lib/content.ts`.

## 2. Modelagem

- `users`: identidade, senha protegida por hash e estado do onboarding;
- `plans` e `plan_days`: conteúdo dos planos guiados;
- `checkins`: humor, nota opcional e data, sempre associado ao usuário autenticado;
- `plan_day_completions`: reflexão e conclusão de cada atividade, única por usuário e dia.

O progresso é derivado das conclusões registradas, evitando duplicação de estado. As migrations Alembic são a fonte de verdade do esquema e do conteúdo inicial.

## 3. Segurança e LGPD

As senhas são armazenadas com hash Argon2. O login devolve um JWT de duração limitada e todas as rotas, exceto saúde, cadastro, login e documentação, exigem esse token. O backend ignora qualquer identidade fornecida pelo cliente e filtra check-ins e conclusões pelo usuário extraído do JWT.

Para produção além do desafio ainda são necessários: consentimento explícito para tratamento de dados emocionais, política de privacidade e retenção, exportação e exclusão de conta, recuperação e verificação de e-mail, proteção contra abuso e logs que não armazenem textos sensíveis.

## 4. Operação

- frontend: Cloudflare Workers com build automático da branch `main`;
- backend: Render com health check em `/health`, documentação em `/docs` e deploy automático;
- banco: PostgreSQL no Supabase, atualizado com `alembic upgrade head`;
- disponibilidade: o frontend aguarda o cold start da API antes de liberar a navegação.

Como evolução operacional, seriam adicionados monitoramento de erros, alertas de disponibilidade, métricas, backup testado e um procedimento de restauração.

## 5. Próximas prioridades

1. Completar privacidade e ciclo de vida da conta: consentimento, recuperação, exportação e exclusão.
2. Criar uma área administrativa para editar conteúdos e planos sem alterar SQL.
3. Adicionar gráfico de histórico emocional, lembretes e observabilidade.

## 6. Integrações futuras

- **IA**: a chamada deve passar pelo backend, sem expor chaves. Deve enviar o mínimo de dados possível, aplicar filtros de segurança, deixar claro que não substitui atendimento profissional e orientar para ajuda adequada em situações de risco.
- **Kiwify**: um webhook no backend deve validar assinatura, processar eventos de forma idempotente e registrar a situação da assinatura. A autorização de recursos premium deve ser conferida pelo backend.

## 7. Escopo e uso de IA

Chat com IA, assinatura, comunidade, vídeos e painel administrativo ficaram fora do escopo mínimo. A base visual foi iniciada com Lovable; a migração para FastAPI, JWT, Alembic, integração ponta a ponta, testes e documentação foram desenvolvidas com apoio do Codex e revisão manual. Não há IA sendo executada em tempo real pela aplicação.
