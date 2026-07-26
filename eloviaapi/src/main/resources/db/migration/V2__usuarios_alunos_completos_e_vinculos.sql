create table if not exists usuarios (
    id uuid primary key,
    nome varchar(160) not null,
    cpf varchar(14) not null unique,
    email varchar(180) not null unique,
    telefone varchar(30),
    senha varchar(255) not null,
    role varchar(20) not null,
    primeiro_acesso boolean not null default true,
    ativo boolean not null default true,
    escola varchar(120),
    cargo varchar(80),
    matricula varchar(40),
    data_criacao timestamptz not null default now(),
    ultimo_login timestamptz
);

alter table alunos add column if not exists foto varchar(300);
alter table alunos add column if not exists data_nascimento date;
alter table alunos add column if not exists sexo varchar(20);
alter table alunos add column if not exists escola varchar(120);
alter table alunos add column if not exists turno varchar(30);
alter table alunos add column if not exists responsavel varchar(160);
alter table alunos add column if not exists telefone_responsavel varchar(30);
alter table alunos add column if not exists email_responsavel varchar(180);
alter table alunos add column if not exists diagnostico text;
alter table alunos add column if not exists cid varchar(40);
alter table alunos add column if not exists necessita_mediador boolean not null default false;
alter table alunos add column if not exists observacoes_iniciais text;
alter table alunos add column if not exists estrategias text;
alter table alunos add column if not exists gatilhos text;
alter table alunos add column if not exists preferencias text;
alter table alunos add column if not exists interesses text;
alter table alunos add column if not exists objetivos_pdi text;
alter table alunos add column if not exists forma_comunicacao text;

create table if not exists mediadores_alunos (
    mediador_id uuid not null references usuarios(id),
    aluno_id uuid not null references alunos(id),
    primary key (mediador_id, aluno_id)
);

create index if not exists idx_usuarios_role_ativo_nome on usuarios(role, ativo, nome);
create index if not exists idx_usuarios_email on usuarios(email);
create index if not exists idx_mediadores_alunos_aluno on mediadores_alunos(aluno_id);
