# Master Liga Online — Web

Front-end do sistema Master Liga Online.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Roteamento | TanStack Router (file-based) |
| Data fetching | TanStack Query + Orval (geração automática a partir do Swagger) |
| Estado global | Zustand |
| HTTP client | Axios |
| Estilização | Tailwind CSS v4 |
| Design system | shadcn/ui (Radix UI + CVA + tailwind-merge) |
| Formulários | React Hook Form + Zod |
| Real-time | Laravel Echo + Pusher |
| Lint/Format | Biome |
| Package manager | pnpm |

## Pré-requisitos

- Node.js 20+
- pnpm 10+ (`corepack enable` já resolve, se você usa Corepack)
- Acesso à API backend (Laravel) rodando localmente ou em ambiente remoto
- Uma URL de Swagger/OpenAPI válida para gerar os clients da API (Orval)

## Instalação

```bash
pnpm install
```

## Variáveis de ambiente

Copie o exemplo e preencha com os valores do seu ambiente:

```bash
cp .env.example .env
```

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000       # URL raiz da API (sem /api no final — os endpoints gerados já incluem esse prefixo)
VITE_API_SWAGGER_URL=                          # URL do Swagger/OpenAPI usada pelo Orval para gerar os hooks da API
```

> `.env` nunca é commitado (está no `.gitignore`). Use `.env.example` como referência de quais variáveis existem.

## Gerando os clients da API (Orval)

Sempre que o Swagger da API mudar (novos endpoints, campos, etc.), regenere os hooks:

```bash
pnpm generate:api
```

Isso lê `VITE_API_SWAGGER_URL` e escreve em `src/api/generated/` — **nunca edite esses arquivos manualmente**, eles são sobrescritos a cada geração.

## Rodando em desenvolvimento

```bash
pnpm dev
```

Abre em `http://localhost:5173` (padrão do Vite).

## Build de produção

```bash
pnpm build
```

Roda `tsc -b` (typecheck) e depois `vite build`. A saída fica em `dist/`.

```bash
pnpm preview
```

Serve o build de produção localmente para conferência.

## Lint e formatação

O projeto usa **Biome** (substitui ESLint + Prettier):

```bash
pnpm lint      # só verifica
pnpm format    # só formata
pnpm check     # lint + format + organize imports, com correção automática
```

Rode `pnpm check` antes de abrir PR — é o mesmo comando que deve passar limpo em CI.

## Adicionando componentes de UI (shadcn/ui)

```bash
pnpm dlx shadcn@latest add <componente> [componente2 ...]
```

Cada componente é copiado para `src/components/ui/` já com Tailwind + Radix UI configurados, e a CLI instala sozinha as dependências específicas daquele componente.

## Estrutura de pastas

```
src/
├── api/generated/       # Código gerado pelo Orval (NÃO editar manualmente)
├── components/ui/       # Design system (shadcn/ui)
├── routes/               # File-based routing (TanStack Router)
│   ├── __root.tsx
│   ├── (auth)/           # Login (rota pública)
│   └── (protected)/      # Rotas que exigem autenticação (_layout com beforeLoad)
├── stores/               # Zustand (auth-store, etc.)
├── lib/                  # api-client (mutator Axios), auth (storage de token), utils
├── schemas/              # Schemas Zod para formulários
└── utils/route-guards.ts # Guards de rota (ensureAuthenticated, ensureGuest)
```

## Autenticação

- Login real via `POST /api/auth/login`, hidratação do usuário via `GET /api/auth/me`.
- Token fica em `localStorage` (opção "lembrar de mim") ou `sessionStorage` (sessão única) — ver `src/lib/auth.ts`.
- Não há endpoint de refresh de token: um `401` limpa a sessão e redireciona para `/login` (ver interceptor em `src/lib/api-client.ts`).
- Rotas dentro de `(protected)` exigem autenticação via `beforeLoad` (`ensureAuthenticated`); a rota de login redireciona para `/` se o usuário já estiver autenticado (`ensureGuest`).

## Editor (VS Code)

O repositório já traz `.vscode/settings.json` e `.vscode/extensions.json` recomendando:
- **Biome** (formatter/lint padrão do projeto)
- **Tailwind CSS IntelliSense**

Instale as extensões recomendadas ao abrir o projeto para evitar falsos positivos de lint no editor.
