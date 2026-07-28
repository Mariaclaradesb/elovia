alter table anamneses add column if not exists serie varchar(80);
alter table anamneses add column if not exists responsavel_nome varchar(180);
alter table anamneses add column if not exists responsavel_parentesco varchar(100);
alter table anamneses add column if not exists responsavel_telefone varchar(30);
alter table anamneses add column if not exists com_quem_mora_outro text;
alter table anamneses add column if not exists acompanha_rotina_escolar text;
alter table anamneses add column if not exists descricao_familia text;
alter table anamneses add column if not exists interesses_potencialidades text;
alter table anamneses add column if not exists atividades_preferidas text;
alter table anamneses add column if not exists dificuldade_importante text;
alter table anamneses add column if not exists orientacao_escola text;
alter table anamneses add column if not exists terapia_outra text;
alter table anamneses add column if not exists comunicacao_tipo varchar(80);
alter table anamneses add column if not exists comunicacao_outra text;
alter table anamneses add column if not exists como_pede_ajuda text;
alter table anamneses add column if not exists adaptacao_escolar text;
alter table anamneses add column if not exists estrategias_funcionam text;
alter table anamneses add column if not exists recomendacao_professor_anterior text;

update anamneses set etapa_atual = least(etapa_atual, 6);

update anamneses anamnese
set responsavel_nome = coalesce(anamnese.responsavel_respondente, aluno.responsavel),
    responsavel_telefone = aluno.telefone_responsavel,
    acompanha_rotina_escolar = anamnese.responsavel_respondente,
    descricao_familia = anamnese.quem_e_aluno,
    interesses_potencialidades = concat_ws(E'\n', nullif(anamnese.interesses, ''), nullif(anamnese.potencialidades, '')),
    dificuldade_importante = anamnese.maior_dificuldade,
    orientacao_escola = anamnese.orientacao_importante,
    comunicacao_tipo = split_part(coalesce(anamnese.comunicacao, ''), E'\n', 1),
    adaptacao_escolar = anamnese.observacao_sala_outros_espacos,
    estrategias_funcionam = aluno.estrategias
from alunos aluno
where aluno.id = anamnese.aluno_id;

update anamnese_medicamentos
set observacoes = concat_ws(E'\n', nullif(observacoes, ''),
    case when nullif(horario, '') is not null then 'Horario: ' || horario end)
where nullif(horario, '') is not null;
