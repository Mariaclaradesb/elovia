# Elovia API

Backend Spring Boot da Elovia.

## Estrutura MVC

```text
src/main/java/elovia/eloviaapi/
|-- config/       # seguranca, CORS e configuracoes gerais
|-- controller/   # endpoints REST
|-- dto/          # objetos de entrada e saida da API
|-- exception/    # tratamento padronizado de erros
|-- model/        # entidades JPA
|-- repository/   # acesso ao banco com Spring Data JPA
`-- service/      # regras de negocio
```

Os nomes das pastas seguem o padrao MVC em ingles. Os nomes de dominio continuam em portugues quando ajudam a leitura: `Aluno`, `SessaoAcompanhamento`, `EventoAcompanhamento`.

## Supabase

O projeto ja esta apontando para o shared/session pooler do Supabase:

```text
DATABASE_URL=jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres.citxmlurmzvkokjbtnhh
DATABASE_PASSWORD=TROQUE_PELA_SUA_SENHA
```

Antes de rodar localmente, defina sua senha no PowerShell:

```powershell
$env:DATABASE_URL="jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
$env:DATABASE_USERNAME="postgres.citxmlurmzvkokjbtnhh"
$env:DATABASE_PASSWORD="SUA_SENHA_REAL"
$env:DATABASE_POOL_SIZE="1"
$env:DATABASE_POOL_MIN_IDLE="0"
$env:FLYWAY_ENABLED="true"
$env:JPA_DDL_AUTO="none"
$env:DB_HEALTH_ENABLED="false"
```

Depois rode:

```powershell
mvn spring-boot:run
```

Teste:

```text
http://localhost:8080/actuator/health
http://localhost:8080/api/test/ping
```

## Tabelas automaticas

As tabelas sao criadas automaticamente pelo Flyway quando:

```text
FLYWAY_ENABLED=true
```

A migration inicial fica em:

```text
src/main/resources/db/migration/V1__criar_tabelas_iniciais.sql
```

O Hibernate nao cria tabelas automaticamente porque:

```text
JPA_DDL_AUTO=none
```

Essa combinacao e mais segura: o banco muda por migrations versionadas, nao por geracao automatica do JPA.

## Endpoints iniciais

```text
GET    /api/test/ping
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/alterar-senha
POST   /api/auth/esqueci-senha
POST   /api/auth/redefinir-senha

GET    /api/mediadores
GET    /api/mediadores/{id}
POST   /api/mediadores
PUT    /api/mediadores/{id}
PATCH  /api/mediadores/{id}/desativar
PATCH  /api/mediadores/{id}/redefinir-senha

GET    /api/alunos
GET    /api/alunos/{id}
POST   /api/alunos
PUT    /api/alunos/{id}
DELETE /api/alunos/{id}
POST   /api/alunos/{id}/mediadores
DELETE /api/alunos/{id}/mediadores/{mediadorId}

POST   /api/sessoes
GET    /api/sessoes/aluno/{alunoId}
PATCH  /api/sessoes/{id}/finalizar
GET    /api/sessoes/{sessaoId}/eventos
POST   /api/sessoes/{sessaoId}/eventos
```

As rotas de auth, mediadores, alunos e dashboard tambem aceitam o formato sem `/api`, por exemplo `/auth/login`.

## Dados de teste

Quando `TEST_DATA_ENABLED=true`, a aplicacao cria cadastros de teste automaticamente:

```text
Administrador
Email: admin@elovia.test
Senha: Admin12345
Primeiro acesso: false

Mediador
Email: mediador@elovia.test
Senha: Mediador12345
Primeiro acesso: true
```

Tambem cria um `Aluno Demo` associado ao `Mediador Demo` se ainda nao houver alunos no banco.

Para testar login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@elovia.test",
  "senha": "Admin12345"
}
```

Use o token retornado nas rotas protegidas:

```text
Authorization: Bearer SEU_TOKEN
```

## Northflank

No Northflank, configure:

```text
Root Directory: eloviaapi
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/*.jar
Health Check: /actuator/health
```

Environment variables:

```text
DATABASE_URL=jdbc:postgresql://aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_USERNAME=postgres.citxmlurmzvkokjbtnhh
DATABASE_PASSWORD=SUA_SENHA_REAL
DATABASE_POOL_SIZE=1
DATABASE_POOL_MIN_IDLE=0
FLYWAY_ENABLED=true
JPA_DDL_AUTO=none
DB_HEALTH_ENABLED=false
```

No Expo/mobile, use somente a URL publica do Northflank, por exemplo:

```javascript
const API_URL = 'https://seu-servico.code.run/api';
```
