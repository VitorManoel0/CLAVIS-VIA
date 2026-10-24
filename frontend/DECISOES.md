# Decisões técnicas

## 1. Arquitetura
React + TanStack Start no front e Supabase como BaaS. O navegador fala direto com a API REST do Supabase (PostgREST) usando a chave pública; a autorização acontece no banco via Row Level Security. Isso elimina um servidor intermediário para um protótipo de leitura/escrita simples e mantém a segurança onde os dados estão. TanStack Query cuida de cache, carregamento e erro; as regras de negócio puras ficam em `lib/content.ts` e são testadas.

## 2. Modelagem
- `plans` / `plan_days`: conteúdo, leitura pública.
- `checkins (user_id, mood, note, created_at)`: um registro por check-in; `mood` restrito por `check`.
- `plan_day_completions (user_id, plan_day_id, reflection, completed_at)`, único por usuário+dia.
Cada usuário é um `auth.users.id`; toda tabela privada tem `user_id` com RLS `auth.uid() = user_id`. A evolução no plano é derivada (dias concluídos ÷ total), sem estado duplicado.

## 3. Segurança / LGPD
Trocar login anônimo por e-mail/OAuth com verificação; termo de consentimento explícito para dados sensíveis (saúde emocional é dado sensível, art. 11 LGPD); minimizar coleta (nota livre opcional); criptografia em repouso (padrão Supabase) e, se necessário, coluna cifrada para notas; região de hospedagem adequada; política de retenção e endpoint de exportação/exclusão de conta (`on delete cascade` já existe); logs sem conteúdo emocional; DPA com fornecedores; revisão de RLS com testes.

## 4. Operação
Deploy do front em Vercel/Netlify/Cloudflare (build estático + SSR) com variáveis de ambiente no painel; banco no Supabase com backups diários/PITR. Observabilidade: Sentry no front, logs e alertas do Supabase, uptime check. Recuperação: rollback do deploy para a versão anterior, restauração de backup, runbook simples.

## 5. Evolução (3 prioridades)
1. Autenticação real + consentimento e onboarding.
2. CMS/admin para conteúdos e planos (hoje via SQL).
3. Lembretes/notificações e histórico de emoções com gráfico semanal.

## 6. Integrações
- **IA**: chamada sempre por servidor (função/edge), nunca expondo a chave; enviar só o mínimo (sem identificadores), filtros de segurança, aviso claro de que não é aconselhamento profissional e encaminhamento para CVV (188) em sinais de risco.
- **Kiwify**: webhook em rota de servidor que valida assinatura/token, grava `subscriptions (user_id, status, expires_at)`; o acesso premium é checado por RLS/função no banco, não no front.

## 7. O que ficou de fora
Chat com IA, perfil, assinatura, notificações, comunidade, vídeos e admin — fora do escopo obrigatório; priorizei o fluxo persistido de ponta a ponta. IA (Lovable) foi usada para gerar a base do código, imagens dos planos e esta documentação, com revisão manual.
