# Modulo de Anamnese

## Onde alterar no mobile

- Perguntas, etapas e opcoes: `mobile/src/constants/anamnese.js`
- Wizard editavel do administrador: `mobile/src/screens/anamnese/AnamneseWizardScreen.js`
- Visualizacao e pesquisa: `mobile/src/screens/anamnese/AnamneseViewScreen.js`
- Comunicacao com a API: `mobile/src/services/anamneseApi.js`
- Campos de escolha: `mobile/src/components/ChoiceChips.js`
- Listas de medicamentos e terapias: `mobile/src/components/RepeatableAnamneseList.js`
- Cores e estilos: `mobile/src/theme/colors.js` e `mobile/src/theme/styles.js`

## Onde alterar no backend

- Rotas REST: `eloviaapi/src/main/java/elovia/eloviaapi/controller/AnamneseController.java`
- Regras de acesso, salvamento e percentual: `eloviaapi/src/main/java/elovia/eloviaapi/service/AnamneseService.java`
- Layout do Word: `eloviaapi/src/main/java/elovia/eloviaapi/service/AnamneseDocxService.java`
- Entidades: arquivos iniciados por `Anamnese` em `eloviaapi/src/main/java/elovia/eloviaapi/model`
- Tabelas: `eloviaapi/src/main/resources/db/migration/V9__anamnese_aluno.sql`

## Rotas

- `GET /api/alunos/{id}/anamnese`
- `PUT /api/alunos/{id}/anamnese/etapas/{etapa}`
- `GET /api/alunos/{id}/anamnese/pesquisa?q=termo`
- `GET /api/alunos/{id}/anamnese/historico`
- `POST /api/alunos/{id}/anamnese/anexos`
- `POST /api/alunos/{id}/anamnese/relatorio`

O administrador pode criar, editar e anexar. Administrador e mediador autorizado podem visualizar, pesquisar e gerar o DOCX. O mediador nao possui rota de edicao no app e o backend tambem bloqueia essa operacao.

## Deploy

No proximo deploy do backend, o Flyway executa a migracao V9 automaticamente quando `FLYWAY_ENABLED=true`. O relatorio DOCX e os anexos usam as mesmas variaveis do modulo Biblioteca: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET`.
