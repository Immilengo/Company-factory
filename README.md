# Company Platform CLI MVP
/**
 * O CLI global é configurado em 2 locais:
 * 1-bin no package.json é mayongi-factory que redireciona para  dist/index.ts
 *2-Utilizar shebang no entrypoint shebang: #!/usr/bin/env node
 3-npm link cria um link global do comando mayongi-factory para esse dist/index.json
 * **/
CLI em Node.js + TypeScript para geração rápida de projetos backend com base em templates corporativos.

## Objetivo do MVP

Este MVP implementa apenas:

- Copiar template
- Substituir placeholders
- Gerar projeto

Não implementa painel web, banco de dados interno, autenticação, deploy, CI/CD, geração automática de módulos, Docker automático, git automático ou integração cloud.

## Stack

- Node.js
- TypeScript
- commander
- inquirer
- chalk
- fs-extra
- ora
- dotenv

## Instalação

```bash
npm install
npm run build
npm link
```

Após `npm link`, o comando `company-cli` fica disponível globalmente no seu ambiente local.

## Uso

```bash
company-cli create <project-name> <template>
```

## Exemplos

```bash
company-cli create ecommerce-api springboot
company-cli create hotel-api express
```

## Fluxo do comando `create`

1. Valida nome do projeto e template
2. Verifica se o template existe
3. Verifica se o diretório de destino já existe
4. Copia template para `generated-projects/<project-name>`
5. Substitui placeholders automaticamente
6. Exibe status no terminal e mensagem final de sucesso

## Placeholders suportados

- `{{PROJECT_NAME}}`
- `{{APP_PORT}}`
- `{{DB_NAME}}`

Regras atuais:

- `APP_PORT`: `8080` para `springboot`, `3000` para `express`
- `DB_NAME`: nome do projeto

Substituição automática em arquivos:

- `.yml`
- `.yaml`
- `.json`
- `.properties`
- `.env`
- `.ts`
- `.js`
- `.md`

## Estrutura

```text
company-platform/
├── src/
│   ├── commands/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── index.ts
├── templates/
│   ├── springboot/
│   └── express/
├── generated-projects/
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## Desenvolvimento local

```bash
npm run dev -- create ecommerce-api springboot
```

## Tratamento de erros

Mensagens amigáveis para cenários comuns:

- `❌ Project name is required`
- `❌ Template is required`
- `❌ Template not found`
- `❌ Project already exists`
