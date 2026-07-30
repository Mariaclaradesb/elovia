alter table documentos_alunos
    alter column nome_arquivo drop not null,
    alter column tipo_arquivo drop not null,
    alter column tamanho_arquivo drop not null,
    alter column url_arquivo drop not null,
    alter column caminho_arquivo drop not null;
