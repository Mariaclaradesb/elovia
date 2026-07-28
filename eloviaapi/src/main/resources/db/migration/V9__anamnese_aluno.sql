create table if not exists anamneses (
    id uuid primary key,
    aluno_id uuid not null unique references alunos(id) on delete cascade,
    etapa_atual integer not null default 1,
    percentual_preenchimento integer not null default 0,
    professor_sala_recursos varchar(180),
    profissional_apoio varchar(180),
    funcao_profissional_apoio varchar(100),
    motivo_matricula_srm text,
    quem_e_aluno text,
    onde_mora text,
    com_quem_mora text,
    desenvolvimento text,
    gestacao text,
    complicacoes_parto text,
    possui_irmaos boolean,
    quantidade_irmaos integer,
    comunicacao text,
    usa_medicacao boolean,
    alergias text,
    restricoes_alimentares text,
    crises_recorrentes text,
    informacoes_medicas text,
    potencialidades text,
    interesses text,
    maior_facilidade text,
    maior_dificuldade text,
    necessita_adaptacoes text,
    reacao_mudancas text,
    hiperfoco text,
    formas_aprendizagem text,
    responsavel_respondente varchar(180),
    rotina_casa text,
    expectativas_familia text,
    orientacao_importante text,
    comportamentos_fora_escola text,
    observacao_sala_outros_espacos text,
    professor_regente text,
    sala_recursos text,
    equipe_pedagogica text,
    observacoes_gerais text,
    criado_por_id uuid references usuarios(id),
    atualizado_por_id uuid references usuarios(id),
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create table if not exists anamnese_medicamentos (
    id uuid primary key,
    anamnese_id uuid not null references anamneses(id) on delete cascade,
    nome varchar(180) not null,
    dosagem varchar(100),
    horario varchar(100),
    observacoes text,
    ordem integer not null default 0
);

create table if not exists anamnese_terapias (
    id uuid primary key,
    anamnese_id uuid not null references anamneses(id) on delete cascade,
    tipo varchar(120) not null,
    frequencia varchar(100),
    profissional varchar(180),
    observacoes text,
    ordem integer not null default 0
);

create table if not exists anamnese_diagnosticos (
    id uuid primary key,
    anamnese_id uuid not null references anamneses(id) on delete cascade,
    comprometimento varchar(180) not null,
    cid varchar(40),
    em_investigacao boolean not null default false,
    ordem integer not null default 0
);

create table if not exists anamnese_anexos (
    id uuid primary key,
    anamnese_id uuid not null references anamneses(id) on delete cascade,
    documento_id uuid not null unique references documentos_alunos(id) on delete cascade,
    criado_em timestamptz not null default now()
);

create table if not exists anamnese_historico (
    id uuid primary key,
    anamnese_id uuid not null references anamneses(id) on delete cascade,
    etapa integer not null,
    resumo text,
    usuario_id uuid references usuarios(id),
    editado_em timestamptz not null default now()
);

create index if not exists idx_anamnese_medicamentos_ordem on anamnese_medicamentos(anamnese_id, ordem);
create index if not exists idx_anamnese_terapias_ordem on anamnese_terapias(anamnese_id, ordem);
create index if not exists idx_anamnese_diagnosticos_ordem on anamnese_diagnosticos(anamnese_id, ordem);
create index if not exists idx_anamnese_historico_data on anamnese_historico(anamnese_id, editado_em desc);
