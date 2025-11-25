Desafio Fullstack – Cubos Movies (Frontend)

Justificativa técnica (por que Next.js)

- SSR/Server Components: As chamadas ao back-end e a aplicação de filtros acontecem no servidor, reduzindo JS enviado ao cliente e melhorando performance/SEO.
- App Router e Middleware: Proteção de rotas, redirecionamentos e preload de dados são nativos (menos código de cola).
- Server Actions: Facilitam login/cadastro e gravação de dados sem criar camadas extras de API no frontend.
- DX e Escalabilidade: Tipagem com TypeScript, roteamento por arquivos e cache de dados prontos para produção.

Stack
- Next.js 16 (App Router, Server Components/Actions)
- TypeScript, ESLint
- Tailwind CSS v4 (tokens com Radix Colors)
- next-themes (switch claro/escuro)
- zod + react-hook-form (forms)
- Vitest

Como rodar

1) Copie as variáveis:

```bash
cp env.example .env.local
```

2) Ajuste `BACKEND_URL` para apontar ao seu back-end.

3) Instale e rode:

```bash
npm i
npm run dev
```

Arquitetura e requisitos atendidos

- Autenticação: login/cadastro via Server Actions que armazenam o token em cookie HTTP-only. `middleware.ts` protege `/movies/*` e redireciona usuários logados para a listagem quando acessam `/login`/`/register`.
- Tema: alternância claro/escuro via `next-themes`, com tokens inspirados no Radix Colors.
- Listagem e paginação: página `/movies/[[...filters]]` busca os filmes no servidor (`fetchMovies`). Paginação de 10 itens por página.
- Filtros pelo servidor: componente `FilterQueryBuilder` lê os parâmetros via `useParams` (rota “catch-all”), concatena as querys e atualiza a URL. No servidor, `buildQueryFromFilterSegments` converte os segmentos em query string consumida pelo back-end.
  - Duração (mín/máx) → `dur-gte-<min>`, `dur-lte-<max>`
  - Data de lançamento (início/fim) → `date-YYYY-MM-DD_YYYY-MM-DD`
  - Gênero(s) → `genre-acao,aventura`
  - Busca rápida (`q`) permanece em `searchParams`, mas é enviada ao back-end no servidor.
- Detalhes do filme: `/movies/[id]` com informações completas.
- Criar/Editar: `/movies/new` e `/movies/[id]/edit` enviam dados via Server Actions diretamente ao back-end.
- Permissões: esperadas pelo back-end (o token do usuário autoriza ações; a UI supõe que somente o dono pode editar/excluir).

Padrões de URL e filtros (useParams)
- A URL usa segmentos para filtros, por exemplo:
  - `/movies/dur-gte-90/date-2020-01-01_2021-12-31/genre-acao,aventura`
- O componente `FilterQueryBuilder` lê/edita esses segmentos com `useParams` e os aplica via `router.push`.
- O servidor transforma esses segmentos em query string para o back-end através de `buildQueryFromFilterSegments`.

Melhorias/observações de UX não explícitas no Figma
- Busca com debounce no campo de pesquisa.
- Feedback visual consistente com tema escuro/claro e tokens.
- Grade responsiva (2/3/5 colunas) e cartões acessíveis.

Scripts úteis
- `npm run dev` – desenvolvimento
- `npm run build` – build
- `npm start` – produção
- `npm run lint` – lint
