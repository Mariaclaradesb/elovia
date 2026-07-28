alter table alunos
    add column if not exists em_investigacao boolean not null default false;

create table if not exists comprometimentos_alunos (
    id uuid primary key,
    aluno_id uuid not null references alunos(id) on delete cascade,
    nome varchar(180) not null,
    cid varchar(40),
    ordem integer not null default 0,
    criado_em timestamptz not null default now()
);

create index if not exists idx_comprometimentos_alunos_aluno_ordem
    on comprometimentos_alunos(aluno_id, ordem);

insert into comprometimentos_alunos (id, aluno_id, nome, cid, ordem)
select
    gen_random_uuid(),
    aluno.id,
    trim(item.valor),
    case when item.ordem = 1 then nullif(trim(aluno.cid), '') else null end,
    item.ordem - 1
from alunos aluno
cross join lateral regexp_split_to_table(coalesce(aluno.diagnostico, ''), E'\r?\n')
    with ordinality as item(valor, ordem)
where trim(item.valor) <> ''
  and lower(trim(item.valor)) not like 'em investiga%'
  and not exists (
      select 1
      from comprometimentos_alunos existente
      where existente.aluno_id = aluno.id
  );

update alunos
set em_investigacao = true
where lower(coalesce(diagnostico, '')) like '%em investiga%';
