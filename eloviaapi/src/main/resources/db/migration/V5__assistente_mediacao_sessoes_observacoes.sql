alter table sessoes_acompanhamento
    add column if not exists mediador_id uuid references usuarios(id),
    add column if not exists data date,
    add column if not exists periodo varchar(20),
    add column if not exists inicio timestamptz,
    add column if not exists fim timestamptz,
    add column if not exists created_at timestamptz;

alter table sessoes_acompanhamento
    alter column aluno_id drop not null;

update sessoes_acompanhamento
set inicio = coalesce(inicio, iniciada_em),
    fim = coalesce(fim, finalizada_em),
    data = coalesce(data, iniciada_em::date),
    created_at = coalesce(created_at, criado_em)
where inicio is null
   or fim is null
   or data is null
   or created_at is null;

create table if not exists sessoes_alunos (
    sessao_id uuid not null references sessoes_acompanhamento(id) on delete cascade,
    aluno_id uuid not null references alunos(id) on delete cascade,
    primary key (sessao_id, aluno_id)
);

insert into sessoes_alunos(sessao_id, aluno_id)
select id, aluno_id
from sessoes_acompanhamento
where aluno_id is not null
on conflict do nothing;

create table if not exists observacoes (
    id uuid primary key,
    sessao_id uuid not null references sessoes_acompanhamento(id),
    aluno_id uuid not null references alunos(id),
    categoria varchar(40) not null,
    descricao text not null,
    disciplina varchar(120),
    local varchar(120),
    estrategia text,
    resultado text,
    observacao_complementar text,
    tipo_registro varchar(20) not null default 'MANUAL',
    audio_url varchar(700),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_sessoes_mediador_status on sessoes_acompanhamento(mediador_id, status, inicio desc);
create index if not exists idx_sessoes_alunos_aluno on sessoes_alunos(aluno_id);
create index if not exists idx_observacoes_sessao_created on observacoes(sessao_id, created_at desc);
create index if not exists idx_observacoes_aluno on observacoes(aluno_id);
