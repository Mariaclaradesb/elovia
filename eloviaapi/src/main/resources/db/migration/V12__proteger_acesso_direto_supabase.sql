do $$
declare
    tabela text;
    tabelas text[] := array[
        'alunos',
        'usuarios',
        'mediadores_alunos',
        'responsaveis_alunos',
        'comprometimentos_alunos',
        'documentos_alunos',
        'sessoes_acompanhamento',
        'eventos_acompanhamento',
        'sessoes_alunos',
        'observacoes',
        'anamneses',
        'anamnese_medicamentos',
        'anamnese_terapias',
        'anamnese_diagnosticos',
        'anamnese_anexos',
        'anamnese_historico',
        'recuperacoes_senha'
    ];
begin
    foreach tabela in array tabelas
    loop
        if to_regclass('public.' || tabela) is not null then
            execute format('alter table public.%I enable row level security', tabela);
            execute format('revoke all on table public.%I from anon, authenticated', tabela);
        end if;
    end loop;
end $$;

revoke all on schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
