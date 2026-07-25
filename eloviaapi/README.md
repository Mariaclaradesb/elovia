# Elovia API

Backend Spring Boot da Elovia.

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
$env:DATABASE_POOL_SIZE="3"
$env:DATABASE_POOL_MIN_IDLE="0"
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

## Koyeb

No Koyeb, configure:

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
DATABASE_POOL_SIZE=3
DATABASE_POOL_MIN_IDLE=0
```

No Expo/mobile, use somente a URL publica do Koyeb, por exemplo:

```javascript
const API_URL = 'https://seu-servico.koyeb.app/api';
```
