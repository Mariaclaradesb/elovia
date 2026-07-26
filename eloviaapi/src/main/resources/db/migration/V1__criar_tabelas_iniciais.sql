create table if not exists alunos (
    id uuid primary key,
    nome varchar(160) not null,
    turma varchar(80),
    observacoes text,
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create table if not exists sessoes_acompanhamento (
    id uuid primary key,
    aluno_id uuid not null references alunos(id),
    status varchar(30) not null,
    iniciada_em timestamptz not null default now(),
    finalizada_em timestamptz,
    observacoes text,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create table if not exists eventos_acompanhamento (
    id uuid primary key,
    sessao_id uuid not null references sessoes_acompanhamento(id),
    tipo varchar(40) not null,
    observacoes text,
    ocorrido_em timestamptz not null default now()
);

create index if not exists idx_alunos_ativo_nome on alunos(ativo, nome);
create index if not exists idx_sessoes_aluno_inicio on sessoes_acompanhamento(aluno_id, iniciada_em desc);
create index if not exists idx_eventos_sessao_ocorrido on eventos_acompanhamento(sessao_id, ocorrido_em desc);
