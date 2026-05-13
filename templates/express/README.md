# Mayongi Node.js Enterprise Backend Template

Base backend **enterprise production-ready** com **Node.js + Express + TypeScript** em arquitetura **Monolito Modular**, pronta para acelerar novos projetos corporativos.

## Stack

- Node.js LTS
- Express.js
- TypeScript
- Prisma ORM + PostgreSQL
- Redis
- JWT + Refresh Token
- Zod Validation
- Winston Logger
- Nodemailer
- Swagger/OpenAPI
- Docker
- ESLint + Prettier
- tsup + tsx

## Arquitetura

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── email/
│   ├── audit/
│   └── common/
├── config/
├── infra/
├── middlewares/
├── shared/
├── utils/
├── types/
├── errors/
└── docs/
```

Cada módulo segue o padrão:

- controller
- service
- repository
- dto
- validator
- routes
- mapper
- interfaces
- schemas

## Recursos Implementados

- Auth completa com JWT + Refresh Token
- Email verification + forgot/reset password
- RBAC com roles ADMIN, USER, MANAGER
- CRUD de usuários com PATCH parcial
- Soft delete
- Paginação padrão
- Request ID tracking
- Global error handling
- Response formatter padronizado
- Logs estruturados (request, startup, auth, exceptions)
- Healthcheck endpoint (`GET /health`)
- Swagger (`/docs`)
- Graceful shutdown
- Bootstrap automático de admin no startup

## Endpoints obrigatórios (Auth)

- `POST /public/auth/register`
- `POST /public/auth/login`
- `POST /public/auth/logout`
- `POST /public/auth/refresh`
- `POST /public/auth/forgot-password`
- `POST /public/auth/reset-password`
- `GET /public/auth/verify-email`
- `POST /public/auth/resend-verification-email`

## Usuário Admin automático

Criado/verificado no startup:

- email: `admin@company.com`
- senha: `Admin123@`
- role: `ADMIN`
- status: `ACTIVE`
- `emailVerified=true`

Pode ser sobrescrito por variáveis de ambiente.

## Variáveis de ambiente

Use `.env.example` como referência.

## Banco e Migrações

1. Configure `.env`
2. Gere client:

```bash
npm run prisma:generate
```

3. Execute migrações:

```bash
npm run prisma:migrate
```

4. (Opcional) Seed:

```bash
npm run seed
```

## Execução Local

```bash
npm install
npm run dev
```

## Docker

A aplicação **não** sobe PostgreSQL/Redis.
Ela usa os serviços globais da empresa (`postgres_global`, `redis_global`) via rede externa.

```bash
docker compose up -d --build
```

## Response padrão

Sucesso:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": []
}
```

## Próximos módulos

A base está pronta para expansão (ERP, CRM, ecommerce, escolar, hotelaria, farmácia, stock, tickets) adicionando novos módulos em `src/modules/*` seguindo o mesmo padrão.
