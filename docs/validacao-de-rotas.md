# Validação de Rotas (routes.ts e route-guards.ts)

Este documento detalha como a navegação é protegida no projeto: quais arquivos são
responsáveis, como cada guarda funciona e como tudo se conecta às rotas do
[TanStack Router](https://tanstack.com/router) (roteamento baseado em arquivos, sem
`middleware.ts` — tudo roda no client via `beforeLoad`).

Para entender de onde vêm o token/usuário/permissões usados aqui, ver
[`autenticacao-e-permissoes.md`](./autenticacao-e-permissoes.md).

---

## 1. `src/utils/routes.ts` — constantes de caminhos

Este arquivo **não é** a árvore de rotas do TanStack Router. É um objeto tipado
(`routes`) que mapeia nomes lógicos para strings literais de caminho, usado em todo o
app para links (`<Link to={routes.admin.rolesAndPermissions}>`), com verificação de tipo
contra `LinkProps["to"]`.

Estrutura (agrupada por domínio):

```ts
export const routes = {
  dashboard: "/dashboard",
  companies: { ... },
  admin: { ... },
  clients: { ... },
  audit: { ... },
  cycles: { ... },
  settings: { ... },
  inventories: { ... },
  inventoryTemplates: { ... },
  systemConfig: { ... },
} satisfies Record<string, unknown>;

export type RoutePath = ...; // union de todos os caminhos
```

Também é usado dentro dos `beforeLoad` das rotas para montar `breadcrumbs` (ex.:
`href: routes.admin.rolesAndPermissions`). Ou seja: `routes.ts` fornece os *caminhos*,
enquanto a árvore de rotas real fica em `src/routes/**` (arquivos), gerada em
`src/route-tree.gen.ts`.

---

## 2. `src/utils/route-guards.ts` — funções de proteção

### `RoutePermissionsStaticData` (tipo)

```ts
type RoutePermissionsStaticData = {
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  deniedPermissions?: Permission[];
};
```

Esse objeto é anexado ao `staticData` da rota do TanStack Router e descreve os
requisitos de permissão daquela página.

### `ensureAuthenticated()`

```ts
export async function ensureAuthenticated() {
  await useAuthStore.getState().initialize();
  if (!useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: "/entrar" });
  }
}
```

- Garante que a sessão foi (re)validada chamando `initialize()` do `auth-store`.
- Se não autenticado, `throw redirect(...)` — no TanStack Router, lançar um `redirect`
  dentro de `beforeLoad` **aborta a navegação** e redireciona o usuário para `/entrar`.

### `redirectIfAuthenticated(to = "/dashboard")`

- Usado nas páginas de autenticação (login, recuperar senha etc.) para tirar de lá um
  usuário que já está logado.
- Se não há token salvo, retorna imediatamente (evita chamada desnecessária).
- Caso contrário, chama `initialize()`; se `isAuthenticated` for `true`,
  `throw redirect({ to })`.

### `ensureRoutePermissions(staticData)`

Síncrona. Lê o estado atual de `usePermissionStore.getState()` e aplica, em ordem:

1. **`deniedPermissions`** (lista de bloqueio) — se o usuário tiver **qualquer uma**
   delas → `redirect({ to: "/dashboard" })`. Útil para esconder uma rota de um perfil
   específico mesmo que ele atenda a outros requisitos.
2. **`requiredPermission`** (permissão única) — se o usuário a possuir, a checagem passa.
3. **`requiredPermissions`** (lista) — usa `hasAllPermissions` (se `requireAll: true`) ou
   `hasAnyPermission` (padrão) para decidir se passa.
4. Se nenhum requisito foi satisfeito (mas algum foi especificado) →
   `redirect({ to: "/dashboard" })`.
5. Se `staticData` for `undefined` ou não tiver nenhum campo de permissão, a rota é
   liberada (no-op).

> Não existe página de "Acesso negado / 403" dedicada no projeto — falhas de permissão
> simplesmente redirecionam para `/dashboard`.

---

## 3. Onde os guards são conectados

A árvore real de rotas fica em `src/routes/**` (file-based routing), com três grupos
principais:

- **`(public)/`** — páginas públicas (ex. `index.tsx`); `layout.tsx` sem guard.
- **`(auth)/`** — `entrar.tsx`, `recuperar-senha.tsx`, `redefinir-senha.tsx`,
  `definir-senha.tsx`, `confirmar-email.tsx`; `layout.tsx` chama
  `redirectIfAuthenticated`.
- **`(protected)/`** — dashboard, franqueados, clientes, ciclos, inventários,
  controle-de-acesso, configurações etc.; `layout.tsx` chama `ensureAuthenticated`.

### Layout do grupo protegido — `src/routes/(protected)/layout.tsx`

```ts
export const Route = createFileRoute("/(protected)")({
  beforeLoad: async () => {
    await ensureAuthenticated();
  },
  component: RouteComponent,
});
```

Como é uma rota de layout (grupo), o TanStack Router executa esse `beforeLoad` **antes**
do `beforeLoad` de qualquer rota filha (execução top-down pela hierarquia de rotas
correspondida). Isso significa que **a autenticação é garantida uma única vez, no nível
do layout**, para toda a árvore protegida. Esse layout também envolve os filhos em
`<PermissionsProvider>`.

### Layout do grupo de autenticação — `src/routes/(auth)/layout.tsx`

```ts
export const Route = createFileRoute("/(auth)")({
  beforeLoad: async () => {
    await redirectIfAuthenticated("/dashboard");
  },
  component: RouteComponent,
});
```

Tem ainda uma checagem extra em tempo de render (`if (isAuthenticated) return <Navigate to="/dashboard" />`) como segunda camada de proteção.

### Permissões por página — exemplo real

`src/routes/(protected)/controle-de-acesso/cargos-e-permissoes.tsx`:

```ts
const rolesStaticData = { requiredPermissions: ["roles.view"] };

export const Route = createFileRoute(
  "/(protected)/controle-de-acesso/cargos-e-permissoes"
)({
  staticData: rolesStaticData,
  beforeLoad: async ({ context }) => {
    await ensureAuthenticated();
    ensureRoutePermissions(rolesStaticData);
    return {
      ...context,
      breadcrumbs: [{ title: "Cargos e Permissões", href: routes.admin.rolesAndPermissions }],
    };
  },
  component: RouteComponent,
});
```

Esse padrão (`staticData` + `beforeLoad` chamando `ensureAuthenticated()` e depois
`ensureRoutePermissions(staticData)`) se repete em ~25 rotas dentro de
`(protected)/**` (ex.: `clientes/index.tsx`, `inventarios/inventario.tsx`,
`franqueados/franqueados-editar.$id.tsx`, `ciclos/$id.cronogramas-novo.tsx`,
`modelos-de-importacao/detalhes.$id.tsx`). Note que `ensureAuthenticated()` é chamado
de forma redundante tanto no layout quanto em cada rota-folha — é uma segurança extra,
não um bug.

### Root — `src/routes/__root.tsx`

Não tem lógica de guard. No mount, dispara
`useAuthStore.getState().initialize()` uma única vez (`useEffect`) para hidratar o
estado de autenticação em um refresh de página completo. Também monta `QueryProvider`,
`EchoProvider` (websockets), `NuqsAdapter`, `TooltipProvider` e uma barra de loading
ligada ao estado de `pending` do router.

### Setup do router — `src/main.tsx`

Cria o router do TanStack a partir de `routeTree` (gerado em
`src/route-tree.gen.ts`) com contexto inicial `{ breadcrumbs: [] }`
(tipado em `src/types/router-context.ts`). Usa `defaultPreload: "intent"` — ou seja,
rotas (e seus `beforeLoad`, incluindo os guards) podem ser **pré-executadas ao passar o
mouse/focar um link**, antes do clique real de navegação.

---

## 4. Fluxo completo (exemplo)

Usuário navega para `/controle-de-acesso/cargos-e-permissoes`:

1. **Bootstrap**: `__root.tsx` já rodou `initialize()` ao carregar o app — token lido do
   storage, usuário e permissões hidratados (ou renovados, se expirado).
2. **`beforeLoad` do layout `(protected)`** → `ensureAuthenticated()`:
   - Se `isAuthenticated` for `false` → `redirect({ to: "/entrar" })`. **Navegação
     interrompida aqui.**
3. **`beforeLoad` da rota-folha** `cargos-e-permissoes.tsx`:
   - `ensureAuthenticated()` novamente (checagem redundante).
   - `ensureRoutePermissions({ requiredPermissions: ["roles.view"] })`:
     - Sem `deniedPermissions` configurado → pula.
     - Sem `requiredPermission` único → pula.
     - `requiredPermissions = ["roles.view"]`, `requireAll` não definido (padrão
       `false`) → verifica `hasAnyPermission(["roles.view"])`.
     - **Se verdadeiro** → guarda retorna normalmente, navegação prossegue, breadcrumbs
       são definidos no contexto, e `RouteComponent` renderiza o `<Outlet />`.
     - **Se falso** → `redirect({ to: "/dashboard" })`. Usuário é silenciosamente
       redirecionado ao dashboard (sem página de 403 dedicada).
4. **Renderização**: como a subárvore está sob `(protected)`, o layout também envolve o
   conteúdo em `<PermissionsProvider>` — componentes internos podem usar
   `<PermissionGuard permission="roles.edit">` ou os hooks `usePermissions()` /
   `usePermissionsContext()` para esconder/mostrar UI, independente da checagem em nível
   de rota.
5. **Chamadas de API da página**: passam pelo `axiosInstance` (`src/lib/api-client.ts`),
   que injeta o Bearer token. Se a API retornar 401 no meio da sessão (token
   invalidado), o interceptor tenta refresh silencioso via cookie; se falhar, limpa
   tokens e força `window.location.href = "/entrar"` (redirect "duro", fora do
   mecanismo de rotas do TanStack Router) — chega ao mesmo destino final da checagem de
   `ensureAuthenticated`, mas por um caminho diferente (detectado durante uma chamada de
   API, não na navegação inicial).
6. **Logout**: `signOut()` limpa os stores de auth e permissão e remove os tokens
   persistidos; a próxima avaliação de `beforeLoad` (próxima navegação) redireciona para
   `/entrar` via `ensureAuthenticated`.