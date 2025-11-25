# Cubos Movies – Fullstack Challenge

Eu desenvolvi uma aplicação completa (frontend + backend) para gerenciamento de filmes com autenticação, filtros avançados, envio de lembretes e suporte a deploy containerizado.

## Visão Geral

- Frontend: usei Next.js 16 (App Router, Server Components/Actions) com TypeScript. A interface é responsiva conforme o Figma e tem alternância claro/escuro baseada no Radix Colors.
- Backend: implementei Fastify + Prisma + PostgreSQL, com autenticação via JWT, filtros paginados, upload de imagens para Google Cloud Storage (URL pré‑assinada) e agendamento de e‑mails de lembrete (Resend).
- Infra: criei Dockerfiles separados para frontend e backend e um `docker-compose.yml` que orquestra PostgreSQL e os dois serviços.

## Atenção Avaliadores (SEEDS)

- Eu incluí um script de seed em `backend/prisma/seed.ts` que:
  - Cria um usuário de demonstração: email `cubos@cubos.com` e senha `Cubos123@`.
  - Insere filmes com pôster/backdrop válidos.
  - Faz upload das imagens para o Google Cloud Storage (GCS).
- Como rodar as seeds (após as migrações):
  - Local: `cd backend && npx prisma migrate deploy && npm run seed`
  - Docker: `docker compose exec backend npx prisma migrate deploy && docker compose exec backend npm run seed`

## O que eu implementei

- Cadastro/login com hashing de senha (bcrypt) e token JWT (armazenado em cookie HTTP-only no frontend).
- CRUD de filmes com controle de permissão: apenas o autor consegue ver, editar ou excluir seus filmes.
- Lista paginada (10 itens por página) com busca textual e filtros de duração, data de lançamento (intervalo), gêneros e nota mínima (0–10 ou 0–100 convertido).
- Detalhes completos por filme, incluindo título original, orçamento, receita e imagem.
- Criação/edição com suporte a datas futuras. Quando a data for futura, o backend agenda o envio de e-mail de lembrete na data de estreia (job horário usando `node-cron` + Resend).
- Endpoint `POST /storage/presign` que gera URL pré-assinada no Google Cloud Storage para upload direto (pensado para evoluir o formulário com upload real de poster).
-- Tema claro/escuro com `next-themes`, header com logout e UX responsiva em 1366px, 414px e intermediários.

## Por que esta stack

- Next.js 16 (App Router): SSR/SSG, Server Components/Actions e um DX excelente com TypeScript, o que simplifica dados no servidor e acessibilidade/tema.
- Fastify: melhor performance que Express, ecossistema de plugins (JWT, CORS, Multipart, Swagger) e validação por schemas com AJV.
- Prisma + PostgreSQL: produtividade com tipagem forte, migrações seguras e consultas flexíveis para filtros.
- Docker + Compose: ambiente reprodutível e simples de subir localmente e em CI/CD.
- Google Cloud Storage: storage de imagens com Signed URLs e opção de público/privado. Eu mantive um proxy quando privado.

## Estrutura do Projeto

- Frontend (`frontend/src`)
  - `app/(auth)/login` e `app/(auth)/register`: telas públicas de autenticação.
  - `app/(protected)/movies`: listagem, paginação, filtros e páginas de criação/edição/detalhes (acesso protegido).
  - `app/api/proxy/[...path]`: proxy interno do Next para o backend (encaminha cookies/headers).
  - `components/ThemeToggle`, `theme-provider`: alternância de tema.
  - `components/movies/*`: cartões, cabeçalho, lista paginada, formulários e detalhes.
  - `components/ui/*`: botões, inputs, selects, modal, sidebar, upload de imagem, rating circular e toast.
  - `hooks/useQueryFilters`: leitura/escrita de filtros na URL.
  - `lib/filters.ts` e `lib/utils.ts`: utilitários de filtros e helpers.
  - `lib/imageProxy.ts`: decide entre proxy do backend ou URL direta do GCS (bucket público).
  - `services/*`: chamadas ao backend (auth, movies, storage).
  - Testes: `ThemeToggle.test.tsx`, `filters.test.ts`, `utils.test.ts`, `MovieCard.test.tsx` (Vitest + Testing Library).

- Backend (`backend/src`)
  - `modules/auth`: controllers, dtos, repository e use cases de login/registro.
  - `modules/movies`: controllers, dtos, repository, use cases e utils (parsers/mapper).
  - `modules/storage`: presign de upload e integração com GCS.
  - `modules/genres`: extração de gêneros a partir dos filmes do usuário.
  - `services/emailService` e `services/reminderService`: envio de e‑mail e scheduler.
  - `lib/httpResponse`: respostas padronizadas e `AppError`.
  - `env.ts`: validação das variáveis de ambiente (sem detalhar aqui).
  - Prisma: `prisma/schema.prisma`, `prisma/migrations/*` e `prisma/seed.ts`.

## Padrões de Projeto e Organização

- **Modularização por domínio**: `src/modules/{auth,movies,storage,genres}` separando controladores, DTOs, repositórios e casos de uso.
- **Use Cases**: a lógica de negócio fica em `useCases` (ex.: criar/atualizar/listar filmes), isolando o domínio das camadas externas.
- **Repository Pattern (Prisma)**: repositórios encapsulam acesso ao banco, facilitando testes e evolução do schema.
- **DTOs/Schemas (TypeBox)**: contratos explícitos de entrada/saída; validação automática pelo Fastify/AJV; geração de Swagger.
- **Services**: integrações externas (Resend, GCS) ficam em `src/services`, desacopladas do restante do domínio.
- **Env Validation (Zod)**: `src/env.ts` valida variáveis de ambiente no boot, evitando “configurações invisíveis”.
- **Erros/Respostas**: utilitários em `src/lib/httpResponse.ts` padronizam payloads de sucesso/erro (com `AppError`).

Essa estrutura facilita manutenção, testes, evolução e leitura do código.

## Arquitetura do Backend

- **Fastify 4** com plugins JWT e CORS (CORS configurado para o frontend).
- **Prisma/PostgreSQL**: modelos `User` e `Movie` (com array de gêneros, datas e campos financeiros). Migração inicial em `backend/prisma/migrations/0001_init/`.
- **Serviços**:
  - `ReminderService`: job horário (`node-cron`) que consulta filmes com lançamento no dia e dispara e-mails via Resend, marcando `reminderSent` para evitar duplicidade.
  - `StorageService`: gera URLs pré-assinadas no Google Cloud Storage (V4 Signed URL) e responde com o link público para uso futuro no frontend.
- **Autenticação**: rotas `/auth/register` e `/auth/login` retornam `{ token, user }`. Demais rotas usam hook `app.authenticate` para validar o JWT.
- **Filtragem/Paginação**: rota `GET /movies` interpreta `page`, `perPage`, `search` e o payload compactado em `filters` (mesmo formato gerado pelo frontend). Campos obrigatórios (duração e intervalo de datas), gêneros (`hasSome`) e nota mínima (suporta valores “70” → 7.0) são aplicados diretamente em consultas Prisma.

### Swagger

- Eu exponho a documentação em `GET /docs` quando o backend está rodando.

## Como eu rodo localmente (sem Docker)

1. Banco de dados: execute um PostgreSQL local e aponte o backend para ele.
2. Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy   # ou prisma migrate dev
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Acesse `http://localhost:3000`. O frontend se comunica com o backend via proxy interno (`/api/proxy`) e usa cookies HTTP‑only.

## Como eu rodo com Docker

1. Na raiz do projeto:
   ```bash
   docker compose up --build
   ```
2. Serviços expostos:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3333`
   - PostgreSQL: `localhost:5432` (user `cubos`, senha `cubos`)
3. Aplique as migrações e (opcionalmente) rode o seed:
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npm run seed
   ```

## Rotas principais do backend

- `POST /auth/register` – cria usuário e retorna token.
- `POST /auth/login` – autentica e retorna token.
- `GET /movies` – lista paginada com filtros (`filters=durationMin=90&releasedStart=2024-01-01&releasedEnd=2024-12-31&genres=acao,drama&voteMin=75`).
- `POST /movies` – cria filme (usa o usuário autenticado como proprietário).
- `GET /movies/:id`, `PUT /movies/:id`, `DELETE /movies/:id` – apenas para o criador.
- `POST /storage/presign` – gera upload URL para o bucket configurado no Google Cloud Storage (body: `{ fileName, contentType }`).
- `GET /genres` – lista de gêneros derivada de filmes existentes (para compor filtros).

## Decisões e observações

- **Permissões**: Conforme o enunciado (“visualizar, editar e excluir filmes devem ser restritas ao usuário que cadastrou”), a listagem retorna apenas os filmes do usuário autenticado, mesmo que o layout sugira “todos os filmes”. Documentado aqui para alinhamento.
- **Filtro de notas**: O frontend suporta segmentos `vote-gte-X`. O backend aceita valores de 0–10 diretamente ou 0–100 (convertendo para 0–10), mantendo flexibilidade.
- **Upload em GCS**: Embora o formulário atual peça apenas uma URL de poster, o backend já oferece presign para facilitar a evolução do design (por isso a dependência do Google Cloud Storage).
- **Lembrete por e‑mail**: optei pelo Resend pela simplicidade; o scheduler é executado ao subir o servidor e a cada hora. Caso deseje usar Mailhog/Ethereal, basta adaptar `sendMovieReminderEmail`.

## Testes e qualidade

- Frontend: Vitest + Testing Library para componentes e utilitários.
- Backend: testes de rotas e serviços com Vitest.
- Tipos e lint: TypeScript em todo o projeto; validação por schema (TypeBox/AJV) e respostas padronizadas.


---

Com isso, o desafio está pronto para ser avaliado – basta seguir as instruções acima para subir todo o ambiente.

