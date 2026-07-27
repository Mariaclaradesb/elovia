create table if not exists documentos_alunos (
    id uuid primary key,
    titulo varchar(180) not null,
    descricao text,
    categoria varchar(40) not null,
    nome_arquivo varchar(260) not null,
    tipo_arquivo varchar(120) not null,
    tamanho_arquivo bigint not null,
    url_arquivo varchar(700) not null,
    caminho_arquivo varchar(500) not null,
    data_documento date,
    data_upload timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    ativo boolean not null default true,
    aluno_id uuid not null references alunos(id),
    usuario_upload_id uuid not null references usuarios(id),
    usuario_ultima_edicao_id uuid references usuarios(id),
    data_ultima_edicao timestamptz
);

create index if not exists idx_documentos_alunos_aluno_upload on documentos_alunos(aluno_id, ativo, data_upload desc);
create index if not exists idx_documentos_alunos_categoria on documentos_alunos(categoria);
