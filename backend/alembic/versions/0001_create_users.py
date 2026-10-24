"""Create the initial CLAVIS VIA schema and demonstration content.

Revision ID: 0001_create_users
Revises: None
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_create_users"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        schema="public",
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True, schema="public")

    op.create_table(
        "plans",
        sa.Column("id", sa.Text(), primary_key=True, nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("theme", sa.Text(), nullable=False),
        sa.Column("minutes", sa.Text(), nullable=False),
        sa.Column("total_days", sa.Integer(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        schema="public",
    )

    op.create_table(
        "plan_days",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("plan_id", sa.Text(), nullable=False),
        sa.Column("day_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("subtitle", sa.Text(), nullable=False, server_default=""),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("reflection", sa.Text(), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(
            ["plan_id"],
            ["public.plans.id"],
            name="plan_days_plan_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "plan_id",
            "day_number",
            name="plan_days_plan_id_day_number_key",
        ),
        schema="public",
    )

    op.create_table(
        "checkins",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("mood", sa.Text(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "mood IN ('pesada', 'ansiosa', 'desanimada', 'irritada', 'sensivel', 'em_paz', 'esperancosa', 'outro')",
            name="checkins_mood_check",
        ),
        sa.CheckConstraint("char_length(note) <= 500", name="checkins_note_check"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["public.users.id"],
            name="checkins_user_id_fkey",
            ondelete="CASCADE",
        ),
        schema="public",
    )
    op.execute("CREATE INDEX checkins_user_created_idx ON public.checkins (user_id, created_at DESC)")

    op.create_table(
        "plan_day_completions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("plan_day_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reflection", sa.Text(), nullable=True),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "char_length(reflection) <= 1000",
            name="plan_day_completions_reflection_check",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["public.users.id"],
            name="plan_day_completions_user_id_fkey",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["plan_day_id"],
            ["public.plan_days.id"],
            name="plan_day_completions_plan_day_id_fkey",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "user_id",
            "plan_day_id",
            name="plan_day_completions_user_id_plan_day_id_key",
        ),
        schema="public",
    )

    op.execute(
        """
        INSERT INTO public.plans
            (id, title, description, theme, minutes, total_days, sort_order)
        VALUES
            ('desanimo', 'Quando o desânimo pesar', 'Um plano curto para respirar, organizar os pensamentos e reencontrar pequenos motivos para continuar.', 'emocoes', '5 a 10 min', 3, 1),
            ('rejeicao', 'Depois de uma rejeição', 'Para acolher a dor de não ter sido escolhida e lembrar do seu valor.', 'relacionamentos', '10 min', 3, 2),
            ('limites', 'Aprendendo a colocar limites', 'Pequenos exercícios para dizer “não” sem culpa e “sim” para si.', 'relacionamentos', '10 min', 3, 3),
            ('fe', 'Quando sua fé estiver cansada', 'Momentos breves de silêncio, leitura e oração para reacender a esperança.', 'fe', '5 min', 3, 4),
            ('direcao', 'Encontrando direção novamente', 'Para quem sente que perdeu o rumo e quer dar o próximo passo com clareza.', 'emocoes', '10 min', 3, 5)
        ON CONFLICT (id) DO NOTHING
        """
    )

    op.execute(
        """
        INSERT INTO public.plan_days
            (plan_id, day_number, title, subtitle, content, reflection, action)
        VALUES
            ('desanimo', 1, 'Respirar e reconhecer', 'Respirar e reconhecer', 'Antes de exigir força de você, vamos aprender a respirar. Nem todo dia precisa ser produtivo. Hoje, o convite é apenas reconhecer como você está e se permitir um novo começo.', 'O que estou sentindo agora, sem julgamento?', 'Faça 6 respirações lentas e escreva uma palavra que descreva seu dia.'),
            ('desanimo', 2, 'Pequenos movimentos', 'Pequenos movimentos', 'Motivação muitas vezes chega depois da ação. Um passo pequeno já muda a direção do dia.', 'Qual é a menor ação possível que me faria bem hoje?', 'Escolha uma tarefa de 5 minutos e faça agora.'),
            ('desanimo', 3, 'Voltar a acreditar', 'Voltar a acreditar', 'Olhe para trás e perceba quantas vezes você atravessou dias difíceis. Você continua aqui.', 'Que dia difícil eu já superei e o que me ajudou?', 'Escreva uma frase de encorajamento para você mesma e deixe à vista.'),
            ('rejeicao', 1, 'Acolher a dor', 'Acolher a dor', 'Ser rejeitada dói, e está tudo bem sentir isso. Hoje, apenas acolha o que sente.', 'O que essa dor está me pedindo?', 'Coloque a mão no coração e respire por um minuto.'),
            ('rejeicao', 2, 'Separar fato de história', 'Separar fato de história', 'Uma rejeição é um acontecimento, não uma sentença sobre quem você é.', 'Que história estou contando a mim sobre isso?', 'Escreva o fato em uma linha e, abaixo, uma interpretação mais gentil.'),
            ('rejeicao', 3, 'Lembrar do seu valor', 'Lembrar do seu valor', 'Seu valor não depende da escolha de alguém.', 'Quais são três qualidades minhas que admiro?', 'Mande uma mensagem carinhosa para alguém que te faz bem.'),
            ('limites', 1, 'Perceber seus limites', 'Perceber seus limites', 'Limites começam com percepção: onde você sente que algo passou do ponto?', 'Em que situação recente eu me senti desrespeitada?', 'Anote uma situação em que gostaria de ter dito “não”.'),
            ('limites', 2, 'Um não pequeno', 'Um não pequeno', 'Colocar limites não é se afastar das pessoas, é se aproximar de quem realmente você é.', 'Do que eu abro mão quando digo sim para tudo?', 'Diga um “não” pequeno para algo que você faria apenas para não desagradar.'),
            ('limites', 3, 'Sustentar sem culpa', 'Sustentar sem culpa', 'A culpa pode aparecer, e isso não significa que você errou.', 'Como posso me tratar com gentileza depois de um limite?', 'Escreva uma frase que você pode repetir quando a culpa vier.'),
            ('fe', 1, 'Silêncio', 'Silêncio', 'Às vezes a fé descansa no silêncio. Hoje, apenas pare por alguns minutos.', 'O que meu coração quer dizer a Deus hoje?', 'Fique dois minutos em silêncio, sem celular.'),
            ('fe', 2, 'Uma palavra', 'Uma palavra', '“Porque eu bem sei os planos que tenho para vocês.” (Jeremias 29:11)', 'O que essa palavra desperta em mim?', 'Releia o versículo três vezes, devagar.'),
            ('fe', 3, 'Gratidão', 'Gratidão', 'A gratidão reacende a esperança mesmo nos dias cinzentos.', 'Pelo que posso agradecer hoje?', 'Escreva três motivos de gratidão.'),
            ('direcao', 1, 'Onde estou', 'Onde estou', 'Antes de decidir para onde ir, reconheça onde você está.', 'Como eu descreveria meu momento em uma frase?', 'Escreva essa frase e a data de hoje.'),
            ('direcao', 2, 'O que importa', 'O que importa', 'Direção nasce dos valores. O que é importante para você de verdade?', 'Quais são meus três valores principais?', 'Liste seus valores e circule o mais importante.'),
            ('direcao', 3, 'Próximo passo', 'Próximo passo', 'Você não precisa ver o caminho inteiro, só o próximo passo.', 'Qual passo posso dar nesta semana?', 'Agende esse passo no seu calendário.')
        ON CONFLICT (plan_id, day_number) DO NOTHING
        """
    )


def downgrade():
    op.drop_table("plan_day_completions", schema="public")
    op.drop_index("checkins_user_created_idx", table_name="checkins", schema="public")
    op.drop_table("checkins", schema="public")
    op.drop_table("plan_days", schema="public")
    op.drop_table("plans", schema="public")
    op.drop_index("ix_users_email", table_name="users", schema="public")
    op.drop_table("users", schema="public")
