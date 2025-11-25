# Cubos Movies – Fullstack Challenge

Aplicação completa (frontend + backend) para gerenciamento de filmes com autenticação, filtros avançados, envio de lembretes e suporte a deploy containerizado.

## Visão Geral

- **Frontend**: Next.js 16 (App Router, Server Components/Actions) totalmente tipado em TypeScript, responsivo conforme o Figma original e com alternância claro/escuro baseada no Radix Colors.
- **Backend**: Fastify + Prisma + PostgreSQL em TypeScript, com autenticação JWT, filtros paginados, upload para Google Cloud Storage (via URL pré-assinada) e agendamento de e-mails usando Resend.
- **Infra**: Dockerfiles separados para frontend e backend + `docker-compose.yml` que orquestra PostgreSQL e ambos os serviços.

## Atenção Avaliadores (SEEDS)

- Há um script de seed em `backend/prisma/seed.ts` que:
  - Cria um usuário de demonstração: email `cubos@cubos.com` e senha `Cubos123@`.
  - Insere filmes com pôster/backdrop válidos.
  - Faz upload das imagens para o Google Cloud Storage (GCS).
- Como rodar as seeds (após as migrações):
  - Local: `cd backend && npx prisma migrate deploy && npm run seed`
  - Docker: `docker compose exec backend npx prisma migrate deploy && docker compose exec backend npm run seed`

## Funcionalidades Implementadas

- Cadastro/login com hashing de senha (bcrypt) e token JWT (armazenado em cookie HTTP-only no frontend).
- CRUD de filmes com controle de permissão: apenas o autor consegue ver, editar ou excluir seus filmes.
- Lista paginada (10 itens por página) com busca textual e filtros de duração, data de lançamento (intervalo), gêneros e nota mínima (0–10 ou 0–100 convertido).
- Detalhes completos por filme, incluindo título original, orçamento, receita e imagem.
- Criação/edição com suporte a datas futuras. Quando a data for futura, o backend agenda o envio de e-mail de lembrete na data de estreia (job horário usando `node-cron` + Resend).
- Endpoint `POST /storage/presign` que gera URL pré-assinada no Google Cloud Storage para upload direto (pensado para evoluir o formulário com upload real de poster).
- Tema claro/escuro com `next-themes`, header fixo com logout e UX responsiva para 1366px, 414px e intermediários.

## Decisões de Arquitetura (por que estas tecnologias?)

- **Next.js 16 (App Router)**: ótimo DX com TypeScript, Server Components/Actions para melhor performance, roteamento e SSR/SSG nativos e integração simples de temas e acessibilidade.
- **Fastify (em vez de Express)**: performance superior, plugins first-class (JWT, CORS, Multipart, Swagger), validação baseada em schema com AJV e excelente suporte a TypeScript.
- **Prisma + PostgreSQL**: produtividade com tipagem end-to-end, migrações consistentes e bom encaixe com filtros/relacionamentos exigidos pelo domínio.
- **Docker + docker-compose**: reprodutibilidade do ambiente, isolamento de dependências (PostgreSQL), facilidade para rodar localmente e em CI/CD.
- **Google Cloud Storage**: armazenamento de imagens com URLs públicas ou via proxy, suporte a Signed URLs e boa documentação. Mantivemos um “modo proxy” no backend para funcionar mesmo com bucket privado.

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

- **Fastify 4** com plugins JWT e CORS (origens múltiplas via `FRONTEND_URL`).
- **Prisma/PostgreSQL**: modelos `User` e `Movie` (com array de gêneros, datas e campos financeiros). Migração inicial em `backend/prisma/migrations/0001_init/`.
- **Serviços**:
  - `ReminderService`: job horário (`node-cron`) que consulta filmes com lançamento no dia e dispara e-mails via Resend, marcando `reminderSent` para evitar duplicidade.
  - `StorageService`: gera URLs pré-assinadas no Google Cloud Storage (V4 Signed URL) e responde com o link público para uso futuro no frontend.
- **Autenticação**: rotas `/auth/register` e `/auth/login` retornam `{ token, user }`. Demais rotas usam hook `app.authenticate` para validar o JWT.
- **Filtragem/Paginação**: rota `GET /movies` interpreta `page`, `perPage`, `search` e o payload compactado em `filters` (mesmo formato gerado pelo frontend). Campos obrigatórios (duração e intervalo de datas), gêneros (`hasSome`) e nota mínima (suporta valores “70” → 7.0) são aplicados diretamente em consultas Prisma.

### Swagger

- Documentação automática disponível em `GET /docs` quando o backend está rodando.

## Como Rodar Localmente (sem Docker)

1. Banco de dados: tenha um PostgreSQL local rodando e atualize `DATABASE_URL` no backend.
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
4. Acesse `http://localhost:3000`. O frontend chama o backend via `BACKEND_URL` e usa cookies HTTP-only para persistir o token.

## Executando com Docker

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

## Rotas Principais do Backend

- `POST /auth/register` – cria usuário e retorna token.
- `POST /auth/login` – autentica e retorna token.
- `GET /movies` – lista paginada com filtros (`filters=durationMin=90&releasedStart=2024-01-01&releasedEnd=2024-12-31&genres=acao,drama&voteMin=75`).
- `POST /movies` – cria filme (usa o usuário autenticado como proprietário).
- `GET /movies/:id`, `PUT /movies/:id`, `DELETE /movies/:id` – apenas para o criador.
- `POST /storage/presign` – gera upload URL para o bucket configurado no Google Cloud Storage (body: `{ fileName, contentType }`).
- `GET /genres` – lista de gêneros derivada de filmes existentes (para compor filtros).

## Justificativas e Observações

- **Permissões**: Conforme o enunciado (“visualizar, editar e excluir filmes devem ser restritas ao usuário que cadastrou”), a listagem retorna apenas os filmes do usuário autenticado, mesmo que o layout sugira “todos os filmes”. Documentado aqui para alinhamento.
- **Filtro de notas**: O frontend suporta segmentos `vote-gte-X`. O backend aceita valores de 0–10 diretamente ou 0–100 (convertendo para 0–10), mantendo flexibilidade.
- **Upload em GCS**: Embora o formulário atual peça apenas uma URL de poster, o backend já oferece presign para facilitar a evolução do design (por isso a dependência do Google Cloud Storage).
- **Lembrete por e-mail**: Optamos pelo Resend pela simplicidade; o scheduler é executado ao subir o servidor e a cada hora. Caso deseje usar Mailhog/Ethereal, basta adaptar `sendMovieReminderEmail`.

## Próximos Passos Sugeridos

- Implementar consumo do endpoint de upload pré-assinado diretamente no formulário (com visualização do poster).
- Adicionar testes automatizados (unitários/E2E) para o backend Fastify.
- Expandir os filtros (ex.: ordenar por popularidade) e adicionar exclusão no frontend.
- Implementar middleware no frontend para redirecionar automaticamente usuários autenticados/deslogados conforme requisito original.

---

Com isso, o desafio está pronto para ser avaliado – basta seguir as instruções acima para subir todo o ambiente.

