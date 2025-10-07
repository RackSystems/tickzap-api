# TickZap API 🚀

## 🛠️ Stack

### Backend

- **Node.js** (v22.16.0) - Runtime JavaScript
- **TypeScript** (v5.8.3) - Linguagem de programação
- **Express.js** (v5.1.0) - Framework web
- **ts-node-dev** - Desenvolvimento com hot reload

### Banco de Dados

- **PostgreSQL** - Banco de dados principal
- **Prisma** (v6.8.2) - ORM e gerenciador de migrações

### Autenticação & Segurança

- **bcrypt** (v6.0.0) - Hash de senhas
- **cookie-parser** - Gerenciamento de cookies
- **cors** - Cross-Origin Resource Sharing

### Integrações & APIs

- **Axios** (v1.9.0) - Cliente HTTP
- **Evolution API** - Integração com WhatsApp

### Armazenamento

- **AWS S3** - Armazenamento de arquivos
- **Multer** (v2.0.2) - Upload de arquivos

### Validação & Middleware

- **express-validator** (v7.2.1) - Validação de dados
- Middlewares customizados para autenticação e tratamento de erros

## 📁 Estrutura do Projeto

```
tickzap-api/
├── src/
│   ├── app/
│   │   ├── controllers/     # Controllers da aplicação
│   │   ├── services/        # Serviços de negócio
│   │   ├── middlewares/     # Middlewares customizados
│   │   ├── validators/      # Validadores de dados
│   │   ├── interfaces/      # Interfaces TypeScript
│   │   ├── enums/           # Enumerações
│   │   └── exceptions/      # Classes de exceção
│   ├── config/              # Configurações
│   ├── helpers/            # Funções auxiliares
│   ├── routes/             # Definição de rotas
│   └── index.ts            # Ponto de entrada
├── prisma/
│   └── schema.prisma       # Schema do banco de dados
├── dist/                   # Código compilado
├── Dockerfile              # Configuração Docker
└── package.json            # Dependências do projeto
```

## 📝 Notas de Desenvolvimento

### Mensagens com Mídia

- Mensagens com mídia precisam salvar o tipo de mídia e URL
- Configure o [MinIO](https://www.min.io/) para simular o ambiente S3 de armazenamento de arquivos em desenvolvimento

### Prisma

- Execute `npx prisma migrate dev` após mudanças no schema
- Execute `npx prisma migrate deploy` para atualizar o banco de dados
- Use `npx prisma studio` para visualizar o banco de dados

- Execute `npx prisma generate` para gerar arquivos de tipos
- Execute `npx prisma db push` para atualizar o banco de dados
- Execute `npx prisma db pull` para atualizar o schema do banco de dados
