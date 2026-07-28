create table recuperacoes_senha (
    id uuid primary key,
    usuario_id uuid not null unique references usuarios(id) on delete cascade,
    codigo_hash varchar(64) not null,
    expira_em timestamptz not null,
    tentativas integer not null default 0,
    criado_em timestamptz not null
);

create index idx_recuperacoes_senha_expiracao on recuperacoes_senha(expira_em);
