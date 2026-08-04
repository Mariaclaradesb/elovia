create table if not exists evidencias_portfolio (
    id uuid primary key,
    aluno_id uuid not null references alunos(id),
    mediador_id uuid not null references usuarios(id),
    cadastrado_por_id uuid not null references usuarios(id),
    usuario_ultima_edicao_id uuid references usuarios(id),
    disciplina varchar(120) not null,
    titulo varchar(180),
    tipo_atividade varchar(30) not null,
    status_atividade varchar(30) not null,
    descricao text,
    observacoes_complementares text,
    foto_caminho varchar(500) not null,
    foto_nome varchar(260) not null,
    foto_tipo varchar(120) not null,
    data date not null,
    horario time not null,
    registrado_em timestamptz not null,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    ativo boolean not null default true
);

create table if not exists evidencias_portfolio_tags (
    evidencia_id uuid not null references evidencias_portfolio(id) on delete cascade,
    tag varchar(60) not null,
    primary key (evidencia_id, tag)
);

create index if not exists idx_evidencias_portfolio_aluno_data
    on evidencias_portfolio(aluno_id, ativo, registrado_em desc);
create index if not exists idx_evidencias_portfolio_mediador
    on evidencias_portfolio(mediador_id, criado_em desc);

alter table evidencias_portfolio enable row level security;
alter table evidencias_portfolio_tags enable row level security;
