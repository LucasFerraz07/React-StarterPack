# Autenticação e Validação de Permissões

Este documento explica como funciona o fluxo de autenticação (login, sessão, tokens) e o
sistema de permissões/roles no projeto, desde os stores (Zustand) até o uso em componentes.

Stack: Vite + React + [TanStack Router](https://tanstack.com/router) + Zustand. Não há
`middleware.ts` — toda a lógica é executada no client.

---

## 1. Visão geral

Existem **dois stores Zustand separados**, que se mantêm sincronizados entre si:

- `src/stores/auth-store.ts` — sessão do usuário (token, usuário autenticado, estado de loading/erro).
- `src/stores/permission-store.ts` — permissões e roles do usuário logado.

A separação existe porque autenticação ("quem é o usuário / ele está logado?") e
autorização ("o que esse usuário pode fazer?") são responsabilidades diferentes. O
`auth-store` é quem popula o `permission-store` sempre que a sessão é criada/atualizada
ou destruída.

---

## 2. Auth Store (`src/stores/auth-store.ts`)

### Estado

```ts
interface AuthState {
  user: UserResource | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _isInitializing: boolean;
}
```

### Principais ações

- **`initialize()`** — ponto de entrada chamado uma vez no mount do app
  (`src/routes/__root.tsx`) e também dentro dos guards de rota. Lê o token persistido
  (`getStoredToken`), verifica se está expirado (`isTokenExpired`) e:
  - se válido → chama `hydrateUser()` para popular `user`;
  - se expirado → tenta `refreshAccessToken()`;
  - se não há token → mantém `isAuthenticated: false`.
  Tem um guard interno (`_isInitializing`) para evitar chamadas concorrentes duplicadas.

- **`signIn(email, password, rememberMe)`** — chama o endpoint gerado
  `loginEmailAndPassword` (`src/api/generated/auth/auth.ts`) e delega o resultado para
  `completeSessionFromLoginResponse`.

- **`completeSessionFromLoginResponse(response)`** —
  1. Persiste o token via `setStoredToken(token, { remember })`.
  2. Se a resposta do login já trouxer `permissions`/`roles`, chama
     `usePermissionStore.getState().setPermissions(...)`.
  3. Marca `isAuthenticated: true`.
  4. Chama `hydrateUser()` para buscar os dados completos do usuário.

- **`hydrateUser()`** — chama o endpoint gerado `me()` (`GET /me`), monta um
  `UserResource`, extrai `permissions`/`roles` da resposta e novamente atualiza o
  `permission-store` via `setPermissions`.

- **`refreshAccessToken()`** — chama `userRefreshToken()`, atualiza o token armazenado;
  em caso de falha, chama `get().signOut()`.

- **`signOut()`** — remove os tokens persistidos (`removeStoredToken`,
  `removeStoredRefreshToken`), limpa o `permission-store`
  (`usePermissionStore.getState().clearPermissions()`) e reseta o estado de auth.

> Importante: o `auth-store` **não guarda** `permissions`/`roles` diretamente — isso é
> responsabilidade exclusiva do `permission-store`, mantido em sincronia pelas ações acima.

### Persistência dos tokens (`src/lib/auth.ts`)

Os tokens são guardados em `sessionStorage` ou `localStorage` (não em cookies), com a
chave definida por variáveis de ambiente (`VITE_TOKEN_STORAGE_KEY`,
`VITE_REFRESH_TOKEN_STORAGE_KEY`, ver `src/utils/env.ts`):

- `getStoredToken()` / `setStoredToken(token, { remember })` / `removeStoredToken()`
  - `remember: true` → `localStorage` (sobrevive ao fechar o navegador).
  - `remember: false` → `sessionStorage` (some ao fechar a aba/navegador).
- `isTokenExpired(token)` — decodifica o payload do JWT (`atob`) e compara `exp` com
  `Date.now()`.
- `decodeToken(token)` — decodifica o payload do JWT.

O `refreshToken` guardado no store, na prática, não é usado para o refresh — o refresh
real depende de um **cookie httpOnly** definido pelo backend (ver seção do
`api-client.ts` abaixo).

### Hook de consumo (`src/hooks/use-auth.ts`)

`useAuth()` é um wrapper fino sobre `useAuthStore()`, expondo estado e ações para os
componentes React sem precisar importar o store diretamente.

---

## 3. Camada de API (`src/lib/api-client.ts`)

Instância única do Axios usada por toda a aplicação, com dois interceptors:

- **Request interceptor**: injeta `Authorization: Bearer <token>` lendo
  `getStoredToken()`.
- **Response interceptor**:
  - Em `401` (e a requisição ainda não foi re-tentada, e não é a própria chamada de
    login/refresh): chama `refreshAccessTokenViaCookie()`
    (`POST /api/auth/refresh-token`, usando o cookie httpOnly do backend), enfileira
    requisições concorrentes que falharam (`isRefreshing` / `refreshQueue`), e re-tenta a
    requisição original com o novo token.
  - Se o refresh falhar: limpa os tokens armazenados e força um redirect "duro"
    (`window.location.href = "/entrar"`) — fora do mecanismo de roteamento do TanStack
    Router.
  - **`403` é tratado de forma diferente de `401`**: 403 significa "sem permissão", não
    "sessão inválida", então **não** desloga o usuário.

Os endpoints de autenticação (`loginEmailAndPassword`, `userRefreshToken`, `me`) são
gerados via Orval a partir do `swagger.json` (ver `orval.config.ts`), em
`src/api/generated/auth/auth.ts`.

Os formulários de autenticação (login, esqueci senha, redefinir senha, definir senha) têm
validação Zod em `src/schemas/auth.ts`.

---

## 4. Permission Store (`src/stores/permission-store.ts`)

### Modelagem (`src/lib/permissions.ts`)

`Role` e `Permission` são simplesmente `type Role = string` / `type Permission = string`
— as strings vêm direto da API no formato `"modulo.acao"` (ex.: `"roles.view"`,
`"roles.edit"`). Não há enum fixo no frontend.

Funções puras auxiliares:

- `checkPermission(permissions: Set<Permission>, permission)` — `permissions.has(permission)`.
- `hasAnyPermission(required: Permission[], userPermissions)`.
- `hasAllPermissions(required: Permission[], userPermissions)`.
- `getModulePermissions(permissions, module)` — filtra permissões que começam com
  `"${module}."`.

### Estado do store

```ts
interface PermissionState {
  roles: Role[];
  permissions: Set<Permission>;
  permissionMap: Map<string, Set<Permission>>; // agrupado por módulo
}
```

Ações: `setPermissions(permissions, roles)` (monta o `Set` e o `Map` por módulo),
`hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `getModulePermissions`,
`clearPermissions`. Todas delegam para as funções puras de `lib/permissions.ts`.

### Hook de consumo (`src/hooks/use-permissions.ts`)

`usePermissions()` — wrapper fino que expõe o estado/ações do `permission-store` para
componentes.

---

## 5. Uso em componentes (`src/providers/permissions-provider.tsx`)

- **`PermissionsProvider`** — envolve o layout protegido
  (`src/routes/(protected)/layout.tsx`) e disponibiliza `hasPermission`,
  `hasAnyPermission`, `hasAllPermissions` via React Context.
- **`usePermissionsContext()`** — hook de acesso ao contexto (lança erro se usado fora
  do provider).
- **`<PermissionGuard>`** — componente que renderiza `children` ou `fallback`
  condicionalmente, com base em `permission` (única) ou `permissions` (array, com opção
  `requireAll`). Serve para esconder/mostrar elementos de UI (botões, itens de menu etc.)
  de forma independente da navegação/rotas.

Exemplo de uso típico:

```tsx
<PermissionGuard permission="roles.edit">
  <Button>Editar</Button>
</PermissionGuard>
```

---

## 6. Resumo do ciclo de vida

1. **Bootstrap do app** (`src/routes/__root.tsx`): `useAuthStore.getState().initialize()`
   roda uma vez, lê o token salvo e, se válido, hidrata `user` (auth-store) e
   `permissions`/`roles` (permission-store).
2. **Login**: `signIn` → `completeSessionFromLoginResponse` → token salvo,
   `isAuthenticated = true`, `hydrateUser()` busca dados completos + permissões.
3. **Requisições autenticadas**: `api-client.ts` injeta o Bearer token; em 401 tenta
   refresh silencioso via cookie; se falhar, redireciona para `/entrar`.
4. **Verificação de permissão em UI**: componentes usam `usePermissions()`,
   `usePermissionsContext()` ou `<PermissionGuard>` para mostrar/esconder elementos.
5. **Verificação de permissão em rota**: ver documento
   [`validacao-de-rotas.md`](./validacao-de-rotas.md), que cobre como
   `route-guards.ts` usa o `permission-store` para bloquear navegação.
6. **Logout**: `signOut()` limpa ambos os stores e os tokens persistidos; a próxima
   verificação de rota redireciona para `/entrar`.