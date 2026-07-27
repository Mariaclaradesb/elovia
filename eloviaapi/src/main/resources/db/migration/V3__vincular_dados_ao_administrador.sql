alter table usuarios add column if not exists administrador_id uuid references usuarios(id);
alter table alunos add column if not exists administrador_id uuid references usuarios(id);

update usuarios mediador
set administrador_id = (
    select admin.id
    from usuarios admin
    where admin.role = 'ADMIN'
    order by admin.data_criacao asc
    limit 1
)
where mediador.role = 'MEDIADOR'
  and mediador.administrador_id is null;

update alunos aluno
set administrador_id = (
    select admin.id
    from usuarios admin
    where admin.role = 'ADMIN'
    order by admin.data_criacao asc
    limit 1
)
where aluno.administrador_id is null;

create index if not exists idx_usuarios_admin_role_nome on usuarios(administrador_id, role, nome);
create index if not exists idx_alunos_admin_ativo_nome on alunos(administrador_id, ativo, nome);
