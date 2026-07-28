alter table usuarios add column if not exists foto varchar(700);

create table if not exists responsaveis_alunos (
    id uuid primary key,
    aluno_id uuid not null references alunos(id) on delete cascade,
    nome varchar(160) not null,
    telefone varchar(30) not null,
    email varchar(180),
    ordem integer not null default 0,
    criado_em timestamptz not null default now()
);

create index if not exists idx_responsaveis_alunos_aluno_ordem
    on responsaveis_alunos(aluno_id, ordem);

insert into responsaveis_alunos (id, aluno_id, nome, telefone, email, ordem)
select
    gen_random_uuid(),
    aluno.id,
    trim(split_part(linha.valor, E'\t', 1)),
    trim(split_part(linha.valor, E'\t', 2)),
    nullif(trim(split_part(linha.valor, E'\t', 3)), ''),
    linha.ordem - 1
from alunos aluno
cross join lateral regexp_split_to_table(
    case
        when nullif(trim(coalesce(aluno.responsaveis, '')), '') is not null then aluno.responsaveis
        when nullif(trim(coalesce(aluno.responsavel, '')), '') is not null then
            concat_ws(E'\t', aluno.responsavel, aluno.telefone_responsavel, aluno.email_responsavel)
        else ''
    end,
    E'\r?\n'
) with ordinality as linha(valor, ordem)
where trim(split_part(linha.valor, E'\t', 1)) <> ''
  and not exists (
      select 1 from responsaveis_alunos existente where existente.aluno_id = aluno.id
  );

update alunos aluno
set necessita_mediador = not exists (
    select 1 from mediadores_alunos vinculo where vinculo.aluno_id = aluno.id
);
