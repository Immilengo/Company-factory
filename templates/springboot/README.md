# Company Core Template (Spring Modular Monolith)

Backend enterprise reutilizavel com Java 21 + Spring Boot 3.

## Modulos
- auth
- users
- roles
- email
- audit
- common
- images (novo modulo generico para multiplas entidades)

## Imagens (reutilizavel)
O modulo `images` usa `ownerType + ownerId`, permitindo anexar imagens a qualquer entidade futura.
Exemplos:
- `USER` para foto de perfil
- `PRODUCT` para galeria de produto (varias imagens)

Endpoints:
- `POST /api/users/{id}/profile-image`
- `GET /api/users/{id}/profile-image`
- `POST /api/images/{ownerType}/{ownerId}`
- `GET /api/images/{ownerType}/{ownerId}`
- `PATCH /api/images/{ownerType}/{ownerId}/{imageId}/primary`
- `DELETE /api/images/{imageId}`

## Auth
- `POST /public/auth/register`
- `POST /public/auth/login`
- `POST /public/auth/logout`
- `POST /public/auth/refresh`
- `POST /public/auth/forgot-password`
- `POST /public/auth/reset-password`
- `GET /public/auth/verify-email`
- `POST /public/auth/resend-verification-email`

## Admin padrao
- Email: `admin@company.com`
- Senha: `Admin123@`

## Run
1. Preencher variaveis a partir de `.env.example`
2. `./mvnw clean package`
3. `./mvnw spring-boot:run`
4. Swagger: `/swagger-ui.html`
