# 🔥 IgnisApp - Back-End API

API RESTful para o sistema de Coleta e Gestão de Ocorrências do Corpo de Bombeiros Militar de Pernambuco (CBMPE). Desenvolvido com Node.js, Express, TypeScript e MongoDB.

## ✨ Funcionalidades Principais

* **Autenticação:** Endpoint de login (`/auth/login`) com validação de credenciais e geração de Token JWT. Middleware para proteger rotas.
* **API de Ocorrências:** Endpoints para CRUD (Create, Read, Update, Delete/Cancel) de ocorrências.
* **API de Usuários:** Endpoints para CRUD (atualmente Create implementado) de usuários.
* **Validação:** Validação de dados de entrada usando Zod.
* **Banco de Dados:** Integração com MongoDB usando Mongoose.
* **CORS:** Configuração para permitir requisições do front-end (Vercel, localhost).
* **Segurança:** Hash de senhas com bcrypt (a ser implementado/confirmado), proteção de rotas com JWT.

## 🚀 Tecnologias Utilizadas

* **Node.js:** Ambiente de execução JavaScript no servidor.
* **Express:** Framework web para Node.js.
* **TypeScript:** Superset do JavaScript para tipagem estática.
* **MongoDB:** Banco de dados NoSQL.
* **Mongoose:** ODM (Object Data Modeling) para MongoDB.
* **Zod:** Biblioteca para validação de schemas de dados.
* **jsonwebtoken:** Para gerar e verificar Tokens JWT.
* **bcryptjs:** Para hash de senhas (ou `bcrypt`).
* **cors:** Middleware para habilitar Cross-Origin Resource Sharing.
* **dotenv:** Para carregar variáveis de ambiente de um arquivo `.env`.

## ⚙️ Configuração e Instalação

**Pré-requisitos:**
* Node.js (versão 18 ou superior recomendada)
* npm (ou Yarn)
* Uma instância do MongoDB (local ou na nuvem como MongoDB Atlas)

**Passos:**

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-seu-repositorio-backend>
    cd <nome-da-pasta-backend>
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto back-end.
    * Adicione as seguintes variáveis (substitua pelos seus valores):
      ```env
      # .env
      MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
      JWT_SECRET=seu_segredo_super_secreto_para_jwt 
      PORT=5000 
      # URL EXATA do front-end para CORS (desenvolvimento)
      FRONTEND_URL=http://localhost:5173 
      # (Opcional) Múltiplas URLs separadas por vírgula para CORS
      # FRONTEND_URLS=http://localhost:5173,[https://ignis-app-front-lv8y.vercel.app](https://ignis-app-front-lv8y.vercel.app) 
      ```
    * **Segurança:** Nunca comite o arquivo `.env` no Git! Adicione `.env` ao seu arquivo `.gitignore`.

## ▶️ Rodando Localmente

1.  **Compile o TypeScript (se necessário):** Se você não usa `ts-node-dev` ou similar, compile primeiro:
    ```bash
    npm run build 
    ```
2.  **Inicie o servidor:**
    ```bash
    npm start 
    # Ou 'npm run dev' se você tiver um script de desenvolvimento com ts-node-dev/nodemon
    ```
3.  A API estará rodando em `http://localhost:5000` (ou a porta definida em `PORT`).

## 🛠️ Build para Produção

1.  **Compile o TypeScript para JavaScript:**
    ```bash
    npm run build 
    ```
2.  Isso gerará os arquivos `.js` na pasta `dist/` (ou a configurada no `tsconfig.json`).

## 📁 Estrutura de Pastas (Principais)

* `dist/`: Código JavaScript compilado (gerado pelo build).
* `src/` (ou similar): Código fonte TypeScript.
    * `Config/`: Configurações (ex: conexão com DB `db.ts`).
    * `Controllers/`: Lógica de controle das rotas (recebe request, chama service, envia response).
    * `Interfaces/`: Definições de tipos e interfaces TypeScript.
    * `Middleware/`: Funções middleware (ex: `authMiddleware.ts`, `errorMiddleware.ts`).
    * `Models/`: Definições de Schema e Model do Mongoose (ex: `Occurrence.ts`, `User.ts`).
    * `Routes/`: Definição dos endpoints da API (ex: `UserRoutes.ts`, `OccurrenceRoutes.ts`).
    * `Services/`: (Opcional) Lógica de negócio mais complexa separada dos controllers.
    * `Validations/`: Schemas de validação (Zod).
    * `index.ts`: Ponto de entrada principal do servidor Express.

## 🗺️ Endpoints da API (Principais)

* **Autenticação:**
    * `POST /api/auth/login`: Autentica usuário e retorna token JWT.
* **Usuários:**
    * `POST /api/users`: Cria um novo usuário (protegido).
    * *Outros endpoints CRUD de usuário (GET, PATCH, DELETE) a serem definidos.*
* **Ocorrências:**
    * `POST /api/occurrences`: Cria uma nova ocorrência (protegido).
    * `GET /api/occurrences`: Lista ocorrências (protegido).
    * `GET /api/occurrences/:id`: Busca uma ocorrência por ID (protegido).
    * `PATCH /api/occurrences/:id`: Atualiza uma ocorrência (protegido).
    * `PATCH /api/occurrences/:id/cancel`: Cancela uma ocorrência (protegido).

## ☁️ Deploy

* O back-end está configurado para deploy no **Render** (ou similar).
* Certifique-se de configurar as variáveis de ambiente `MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL` (com a URL da Vercel) nas settings do serviço no Render.
* O comando de build no Render deve ser `npm run build` (ou `tsc`).
* O comando de start no Render deve ser `npm start` (ou `node dist/index.js`).
