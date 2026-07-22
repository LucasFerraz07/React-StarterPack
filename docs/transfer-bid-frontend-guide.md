# Negociação entre participantes (Transfer Bid) — guia para o front

Todas as rotas abaixo exigem o header `Authorization: Bearer <token>` (middleware `auth.api`) e retornam o envelope padrão da API:

```json
{ "error": false, "message": "...", "data": { ... } }
```

Em erro (400/403/409/422), o mesmo envelope vem com `"error": true` e `"message"` explicando o motivo (ex.: saldo insuficiente, jogador não pertence ao elenco, janela de mercado fechada).

A negociação só é aceita durante uma janela de mercado aberta (fase da temporada `first_window` ou `mid_window`). Fora disso, `POST /transfer-bid` e `PUT /transfer-bid/{id}/aceitar` retornam 409.

---

## Rotas disponíveis

| Método | Rota | Permissão | Uso |
|---|---|---|---|
| `GET` | `/transfer-bid` | `transfer-bid.view` | Lista as propostas enviadas e recebidas pelo usuário logado |
| `GET` | `/transfer-bid/{id}` | `transfer-bid.view` | Detalhe de uma proposta |
| `POST` | `/transfer-bid` | `transfer-bid.create` | Cria uma proposta |
| `PUT` | `/transfer-bid/{id}/aceitar` | `transfer-bid.update` | Destinatário aceita a proposta (efetiva a troca) |
| `PUT` | `/transfer-bid/{id}/recusar` | `transfer-bid.update` | Destinatário recusa a proposta |
| `PUT` | `/transfer-bid/{id}/cancelar` | `transfer-bid.update` | Proponente cancela a própria proposta pendente |

O objeto **proposta** tem dois lados: **proposer** (quem cria) e **receiver** (quem recebe). Cada lado pode "dar" jogadores e/ou dinheiro — isso é representado na criação por 4 campos (`offered_*` = o que o proponente dá, `requested_*` = o que o proponente está pedindo que o destinatário dê).

---

## Caso 1 — Botão "Comprar jogador" (apenas dinheiro por 1 jogador)

O usuário logado oferece **somente dinheiro** por **1 jogador** do elenco de outro participante.

```
POST /transfer-bid
```

```json
{
  "receiver_id": "uuid-do-dono-do-jogador",
  "offered_cash": 250000,
  "requested_players": ["uuid-do-jogador-desejado"]
}
```

- `offered_cash`: valor que o usuário logado vai pagar (número, mínimo `0.01`).
- `requested_players`: array com **exatamente 1** `player_id` — o jogador que o usuário quer comprar. Ele precisa pertencer ao elenco do `receiver_id` no momento da criação (a API valida isso).
- Não envie `offered_players` nem `requested_cash` neste fluxo.

Após o destinatário aceitar (`PUT /transfer-bid/{id}/aceitar`), o jogador passa a pertencer ao elenco de quem propôs e o valor é debitado/creditado nos saldos de ambos.

---

## Caso 2 — Botão "Troca" (jogador(es) + dinheiro opcional, dos dois lados)

O usuário logado oferece **ao menos 1 jogador** (podendo somar dinheiro) por **ao menos 1 jogador** do outro lado (podendo também pedir dinheiro do outro lado).

```
POST /transfer-bid
```

```json
{
  "receiver_id": "uuid-do-outro-participante",
  "offered_players": ["uuid-jogador-1", "uuid-jogador-2"],
  "offered_cash": 50000,
  "requested_players": ["uuid-jogador-desejado-1"],
  "requested_cash": 0
}
```

- `offered_players`: jogadores do **próprio elenco** que serão dados na troca. Obrigatório ter ao menos 1 item neste fluxo.
- `offered_cash`: opcional — dinheiro que o usuário logado está adicionando à oferta. Omita o campo (ou não envie) se não houver dinheiro desse lado.
- `requested_players`: jogadores do elenco do `receiver_id` que o usuário logado está pedindo em troca. Obrigatório ter ao menos 1 item.
- `requested_cash`: opcional — dinheiro que o destinatário deveria adicionar à troca (raramente usado nesse fluxo, mas suportado). Omita se não for usar.

**Regra geral de validação da API** (vale para os dois casos): a proposta precisa ter pelo menos um item no total (jogador ou dinheiro, de qualquer lado) — o backend rejeita com 422 se todos os campos vierem vazios.

---

## Aceitando, recusando ou cancelando

```
PUT /transfer-bid/{id}/aceitar   -> apenas o receiver_id da proposta pode chamar
PUT /transfer-bid/{id}/recusar   -> apenas o receiver_id da proposta pode chamar
PUT /transfer-bid/{id}/cancelar  -> apenas o proposer (quem criou) pode chamar
```

Nenhuma dessas rotas espera corpo (`body`) — o `id` vai na URL. Todas retornam a proposta atualizada em `data`.

Ao **aceitar**, a API revalida tudo de novo (posse dos jogadores e saldo em dinheiro podem ter mudado desde a criação da proposta) — trate o 422/409 de resposta como "a proposta não é mais válida, atualize a tela".

---

## Formato de resposta (`TransferBidResource`)

```json
{
  "id": "uuid",
  "league_id": "uuid",
  "season_id": "uuid",
  "proposer": { "id": "uuid", "username": "string", "phone": "string" },
  "receiver": { "id": "uuid", "username": "string", "phone": "string" },
  "status": "pending | accepted | rejected | cancelled",
  "items": [
    {
      "id": 1,
      "side": "proposer | receiver",
      "item_type": "player | cash",
      "player": { "id": "uuid", "name": "...", "overall": 88, "position": "...", "category": "gold", "salary": "50000.00", "passe": "500000.00", "image_url": "..." },
      "amount": "250000.00"
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

- `items` mistura os dois lados: filtre por `side` para separar "o que o proposer oferece" (`side: "proposer"`) de "o que o receiver oferece" (`side: "receiver"`).
- Quando `item_type` é `"player"`, o campo `player` vem preenchido e `amount` é `null`. Quando é `"cash"`, o inverso: `amount` vem preenchido e `player` é `null`.

## Listagem (`GET /transfer-bid`)

Filtros de query string aceitos: `page`, `per_page`, `status` (`pending`/`accepted`/`rejected`/`cancelled`). A lista sempre retorna apenas propostas onde o usuário logado é `proposer` ou `receiver` — use `status=pending` para montar as telas de "propostas recebidas" (filtrando client-side por `receiver.id === meuId`) e "propostas enviadas" (`proposer.id === meuId`).