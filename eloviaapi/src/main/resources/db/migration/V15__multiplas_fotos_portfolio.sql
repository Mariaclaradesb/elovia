create table if not exists evidencias_portfolio_fotos (
    id uuid primary key,
    evidencia_id uuid not null references evidencias_portfolio(id) on delete cascade,
    caminho varchar(500) not null,
    nome varchar(260) not null,
    tipo varchar(120) not null,
    ordem integer not null default 0,
    criado_em timestamptz not null default now()
);

insert into evidencias_portfolio_fotos (id, evidencia_id, caminho, nome, tipo, ordem)
select id, id, foto_caminho, foto_nome, foto_tipo, 0
from evidencias_portfolio
where foto_caminho is not null
on conflict (id) do nothing;

alter table evidencias_portfolio drop column if exists foto_caminho;
alter table evidencias_portfolio drop column if exists foto_nome;
alter table evidencias_portfolio drop column if exists foto_tipo;

create index if not exists idx_evidencias_portfolio_fotos_evidencia
    on evidencias_portfolio_fotos(evidencia_id, ordem);

alter table evidencias_portfolio_fotos enable row level security;
