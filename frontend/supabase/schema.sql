-- CLAVIS VIA — esquema do banco (cole no SQL Editor do Supabase e execute).
-- Idempotente o suficiente para rodar de novo em um projeto limpo.

-- ============ Conteúdo (público, somente leitura) ============
create table if not exists public.plans (
  id text primary key,
  title text not null,
  description text not null,
  theme text not null,
  minutes text not null,
  total_days int not null,
  sort_order int not null default 0
);

create table if not exists public.plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans(id) on delete cascade,
  day_number int not null,
  title text not null,
  subtitle text not null default '',
  content text not null,
  reflection text not null,
  action text not null,
  unique (plan_id, day_number)
);

-- ============ Dados do usuário (privados) ============
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  mood text not null check (mood in ('pesada','ansiosa','desanimada','irritada','sensivel','em_paz','esperancosa','outro')),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);
create index if not exists checkins_user_created_idx on public.checkins (user_id, created_at desc);

create table if not exists public.plan_day_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  plan_day_id uuid not null references public.plan_days(id) on delete cascade,
  reflection text check (char_length(reflection) <= 1000),
  completed_at timestamptz not null default now(),
  unique (user_id, plan_day_id)
);

-- ============ Permissões ============
grant select on public.plans, public.plan_days to anon, authenticated;
grant select, insert, update, delete on public.checkins, public.plan_day_completions to authenticated;

alter table public.plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.checkins enable row level security;
alter table public.plan_day_completions enable row level security;

drop policy if exists "plans readable" on public.plans;
create policy "plans readable" on public.plans for select using (true);
drop policy if exists "plan_days readable" on public.plan_days;
create policy "plan_days readable" on public.plan_days for select using (true);

drop policy if exists "own checkins" on public.checkins;
create policy "own checkins" on public.checkins for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own completions" on public.plan_day_completions;
create policy "own completions" on public.plan_day_completions for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============ Conteúdo de demonstração ============
insert into public.plans (id, title, description, theme, minutes, total_days, sort_order) values
 ('desanimo','Quando o desânimo pesar','Um plano curto para te ajudar a respirar, organizar os pensamentos e reencontrar pequenos motivos para continuar.','emocoes','5 a 10 min',3,1),
 ('rejeicao','Depois de uma rejeição','Para acolher a dor de não ter sido escolhida e lembrar do seu valor.','relacionamentos','10 min',3,2),
 ('limites','Aprendendo a colocar limites','Pequenos exercícios para dizer “não” sem culpa e “sim” para si.','relacionamentos','10 min',3,3),
 ('fe','Quando sua fé estiver cansada','Momentos breves de silêncio, leitura e oração para reacender a esperança.','fe','5 min',3,4),
 ('direcao','Encontrando direção novamente','Para quem sente que perdeu o rumo e quer dar o próximo passo com clareza.','emocoes','10 min',3,5)
on conflict (id) do nothing;

insert into public.plan_days (plan_id, day_number, title, subtitle, content, reflection, action) values
 ('desanimo',1,'Respirar e reconhecer','Respirar e reconhecer','Antes de exigir força de você, vamos aprender a respirar. Nem todo dia precisa ser produtivo. Hoje, o convite é apenas reconhecer como você está e se permitir um novo começo.','O que estou sentindo agora, sem julgamento?','Faça 6 respirações lentas e escreva uma palavra que descreva seu dia.'),
 ('desanimo',2,'Pequenos movimentos','Pequenos movimentos','Motivação muitas vezes chega depois da ação. Um passo pequeno já muda a direção do dia.','Qual é a menor ação possível que me faria bem hoje?','Escolha uma tarefa de 5 minutos e faça agora.'),
 ('desanimo',3,'Voltar a acreditar','Voltar a acreditar','Olhe para trás e perceba quantas vezes você atravessou dias difíceis. Você continua aqui.','Que dia difícil eu já superei e o que me ajudou?','Escreva uma frase de encorajamento para você mesma e deixe à vista.'),
 ('rejeicao',1,'Acolher a dor','Acolher a dor','Ser rejeitada dói, e está tudo bem sentir isso. Hoje, apenas acolha o que sente.','O que essa dor está me pedindo?','Coloque a mão no coração e respire por um minuto.'),
 ('rejeicao',2,'Separar fato de história','Separar fato de história','Uma rejeição é um acontecimento, não uma sentença sobre quem você é.','Que história estou contando a mim sobre isso?','Escreva o fato em uma linha e, abaixo, uma interpretação mais gentil.'),
 ('rejeicao',3,'Lembrar do seu valor','Lembrar do seu valor','Seu valor não depende da escolha de alguém.','Quais são três qualidades minhas que admiro?','Mande uma mensagem carinhosa para alguém que te faz bem.'),
 ('limites',1,'Perceber seus limites','Perceber seus limites','Limites começam com percepção: onde você sente que algo passou do ponto?','Em que situação recente eu me senti desrespeitada?','Anote uma situação em que gostaria de ter dito “não”.'),
 ('limites',2,'Um não pequeno','Um não pequeno','Colocar limites não é se afastar das pessoas, é se aproximar de quem realmente você é.','Do que eu abro mão quando digo sim para tudo?','Diga um “não” pequeno para algo que você faria apenas para não desagradar.'),
 ('limites',3,'Sustentar sem culpa','Sustentar sem culpa','A culpa pode aparecer, e isso não significa que você errou.','Como posso me tratar com gentileza depois de um limite?','Escreva uma frase que você pode repetir quando a culpa vier.'),
 ('fe',1,'Silêncio','Silêncio','Às vezes a fé descansa no silêncio. Hoje, apenas pare por alguns minutos.','O que meu coração quer dizer a Deus hoje?','Fique dois minutos em silêncio, sem celular.'),
 ('fe',2,'Uma palavra','Uma palavra','“Porque eu bem sei os planos que tenho para vocês.” (Jeremias 29:11)','O que essa palavra desperta em mim?','Releia o versículo três vezes, devagar.'),
 ('fe',3,'Gratidão','Gratidão','A gratidão reacende a esperança mesmo nos dias cinzentos.','Pelo que posso agradecer hoje?','Escreva três motivos de gratidão.'),
 ('direcao',1,'Onde estou','Onde estou','Antes de decidir para onde ir, reconheça onde você está.','Como eu descreveria meu momento em uma frase?','Escreva essa frase e a data de hoje.'),
 ('direcao',2,'O que importa','O que importa','Direção nasce dos valores. O que é importante para você de verdade?','Quais são meus três valores principais?','Liste seus valores e circule o mais importante.'),
 ('direcao',3,'Próximo passo','Próximo passo','Você não precisa ver o caminho inteiro, só o próximo passo.','Qual passo posso dar nesta semana?','Agende esse passo no seu calendário.')
on conflict (plan_id, day_number) do nothing;
