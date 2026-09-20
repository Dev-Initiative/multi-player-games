# Turn-Based Game Server — Project Definition

**Status:** definition (no code yet) · **Last updated:** 2026-09-20

---

## 1. Summary

An asynchronous turn-based game server, in the shape of iMessage/GamePigeon. A
player invites opponents by username, they take turns in rotation, and the game
survives any of them being offline for days. The server is authoritative:
clients submit *intent*, never state.

**Seat count is a variable, not a constant.** The engine knows only that players
take turns; how many there are is per-game configuration. v1 ships four games,
all playable at two seats, with Dots and Boxes also playable at three to six.

Four games ship on one shared engine. The games are deliberately simple. The
engineering is the product.

---

## 2. Goals

**G-1 — Provable correctness under concurrency.** The system holds a set of
stated invariants (§6) even when moves are submitted simultaneously, retried
after timeouts, or replayed out of order. Each invariant has a named test.

**G-2 — One engine, many games.** A game is one implementation of one
interface (§7). The test is structural, not a stopwatch: **adding a game must
not require touching `application/`, `persistence/` or `transport/`.** If it
does, the abstraction has leaked.

Rules differ completely between games — that is the only thing that differs.
Turn enforcement, idempotency, the move log, replay, push, resume and
authorization are written once and inherited. Per game you write a state
record, `validate`, `apply`, `isTerminal`/`winner`, `viewFor`, a move type,
rules tests, and ~50 lines of canvas rendering. Nothing else.

Battleship is the one declared exception, and is budgeted as an engine change
rather than a plugin (§9, §11). Declaring that up front is what stops it being
mistaken for a design failure at M6.

**G-3 — Genuinely playable.** Two real people on two real devices can finish a
game of Dots and Boxes over the course of a day.

**G-4 — Measured, not asserted.** Throughput and p99 latency come off a
dashboard, not out of a README adjective.

---

## 3. Non-goals

Stated explicitly so they can be refused later without re-litigating.

| Out of scope | Why |
|---|---|
| Real-time simulation / tick loop | Different project. Nothing here runs while the players are idle. |
| Teams / shared seats | One seat, one player. Teams would distort the winner, scoring and `viewFor` at once. |
| Single player vs the computer | **Planned as the first addition after v1** (§12). Every game must be playable human-vs-human first; a bot that plays through the public API is the proof the API is complete, not a substitute for it. |
| Removing a dropped player | Turn order is a fixed rotation over every seat. If someone stops playing the game stalls or is abandoned (§14); the others cannot vote them out. Planned, not now. |
| Joining a game in progress | Seats are fixed at start; a late join would renumber over a non-empty move log (§5). |
| Password reset, email verification, OAuth, 2FA | Auth is a thin slice (§7.1). These are solved problems that consume weeks. |
| Native mobile apps | Responsive web only. |
| Animation, sound, polish | The frontend renders a board and accepts clicks. |
| Spectators, chat, friends list, ELO | Product features. Zero engineering signal. |
| Horizontal scale past 2 nodes | Two nodes is enough to expose every distribution bug that matters here. |
| Undo / takeback | Breaks the append-only move log for no benefit. |

---

## 4. Users and core flows

One user type: **player**.

1. **Register / log in** — username + password, receive a token.
2. **Open a lobby** — pick a game type and invite one or more opponents by
   username, up to `seats().max()`. The game is created in `WAITING`, creator
   in the first slot, already accepted.
3. **See pending invitations** — games where you hold an unaccepted seat.
4. **Accept or decline** — a decline frees that slot. It does **not** cancel
   the game; the lobby stays open.
5. **The game starts** — either **automatically**, the instant every invited
   seat has accepted, or **whenever the creator chooses** to begin with fewer.
   Invite 4 and have all 4 accept, and it starts with no further action. Have
   only 1 accept, and the creator can still start a 2-player game, or cancel.
   A creator start is refused below `seats().min()`.
6. **Take a turn** — submit a move; server validates, applies, advances turn.
7. **Get nudged** — if an opponent is connected, they see the move immediately
   via WebSocket push. If not, they see it on next load.
8. **Resume** — a plain authenticated read returns everything needed to render
   the game. No dependence on any live connection.
9. **Finish** — win, lose, draw or resign. Game becomes read-only.

**Two triggers, one transition.** Auto-start and creator-start run the same
code. Auto-start is performed *inside the transaction of the accept that closes
the last pending seat*, so it claims the same version and is indistinguishable
from any other transition. The invariant stays enforced in one place (C8).

**A decline disables auto-start.** Once any seat is declined, "every invited
seat accepted" can never become true, so the creator must decide explicitly.
That is deliberate: a decline is information they should act on, not something
to be silently started around.

---

## 5. Domain model

The **move log is truth**. Game state is a materialised cache that must always
equal a replay of the log from the initial state.

Tables, columns, types and indexes are deliberately **deferred to
implementation** (M2). What follows is the conceptual model, and what any
eventual schema has to be able to guarantee.

### Entities

- **Player** — an account, identified by a unique username.
- **Game** — one instance of one rules type. Carries its status, its derived
  state, whose turn it is, who created it, and a version used for optimistic
  concurrency.
- **Seat** — a player's place in a game. While the game is in the lobby it
  carries acceptance and decline state; after start it is an index in the turn
  rotation.
- **Move** — one accepted action by one seat, at one position in a strictly
  ordered sequence, carrying a client-supplied idempotency key.

### Game lifecycle

```
WAITING ──▶ SETUP ──▶ ACTIVE ──▶ FINISHED
   │          (Battleship only)      ▲
   │                                 │
   ├──▶ CANCELLED                    └── ABANDONED
   └──▶ ACTIVE
```

### What any schema must guarantee

The storage layer should enforce these structurally wherever it can, rather
than leaving them to application code:

- Two moves cannot occupy the same position in a game's sequence.
- A resubmitted move, identified by its idempotency key, cannot apply twice.
- A player cannot hold two seats in the same game.
- Only the creator can start or cancel.

### Four deliberate decisions

These are design commitments, and survive whatever shape the schema takes.

- **An invitation is a game, not a separate entity.** Every invited seat exists
  from creation, unaccepted. Accepting is a claim against that seat — the
  *same* optimistic-concurrency mechanism as making a move. One mechanism, two
  uses, and no separate invitation lifecycle to keep consistent.
- **The move log records the seat, not the player.** Replay is then independent
  of accounts entirely, and the log is about the game rather than about
  identity.
- **Seats are renumbered at start.** The lobby hands out provisional slots.
  When the game starts, declined and still-pending seats are dropped and the
  accepted ones are renumbered `0..k-1`, preserving invitation order with the
  creator at `0`. Invite three, have one accept, and the game begins as a clean
  two-seat game.

  This is safe **only** because it happens at the `WAITING → ACTIVE` boundary,
  while the move log is still empty. Renumbering once any move exists would
  silently invalidate replay and break C3. **Nothing may renumber a seat after
  the first move.**

- **A finished game keeps its log.** The state column is the disposable copy;
  the log is not. Keeping it is what makes a finished game replayable move by
  move — an animation from the opening to the final position — and what lets a
  rules fix rebuild historical games instead of freezing their results. If
  storage ever forces the issue, the answer is to archive or compress the log,
  never to delete it. Deleting it would make C3 unverifiable exactly where a
  wrong result is permanent and nobody is left to notice it.

---

## 6. Correctness guarantees

The spine of the project. Each is a stated invariant with a named test; these
tests are the deliverable, not a by-product.

| ID | Guarantee | Test |
|---|---|---|
| **C1** | **Exactly-once.** No two accepted moves in a game share a sequence number. A move submitted N times under the same idempotency key is applied at most once and returns the same result each time. | `ConcurrentMoveTest` |
| **C2** | **Turn integrity.** A move is accepted only if the submitter holds the seat whose turn it is, at the version they claimed against. | `TurnIntegrityTest` |
| **C3** | **Replay equivalence.** The log is gapless `1..N`, and replaying it from the initial state reproduces the stored state exactly. | `ReplayInvariantTest` |
| **C4** | **Legality.** No accepted move violates its game's rules. A rejected move leaves zero trace: no log row, no version bump. | per-game `RulesTest` |
| **C5** | **Confidentiality.** A player never receives, in any response or push, any field the rules declare hidden from them. | `HiddenStateTest` |
| **C6** | **Durability.** Full game state is recoverable by an authenticated read with no live connection and no in-memory session. | `ColdResumeTest` |
| **C7** | **Authorization.** A player can only read or act on games in which they hold a seat. | `AuthorizationTest` |
| **C8** | **Start integrity.** A game leaves `WAITING` exactly once — by auto-start, creator start, or cancel — however many accepts, declines, starts and cancels race. Auto-start fires only when every invited seat has accepted, and in the same transaction as that last accept. A creator start is refused below `seats().min()`. Only the creator may start or cancel. | `ConcurrentStartTest` |

**The headline test (C1).** Fire 50 threads at one game at the same version.
Assert: exactly one acceptance, forty-nine rejections, and exactly one move recorded at
that sequence number. Write it before the fix, so it goes red first.

### The claim

Every state transition — accepting an invitation, starting, making a move,
resigning — uses one mechanism: a **compare-and-swap on the game's version**.

The caller sends the version it last read. The write applies only if the game
is still at that version *and* the caller is entitled to make that particular
transition, and it bumps the version as part of the same operation.

If the compare fails, nothing happened. Report the conflict with the current
view attached, so the client reconciles without a second round trip. No locks
are held across a network call, and there is exactly one place in the codebase
where a transition is authorised.

---

## 7. Architecture

```
transport/     REST controllers, WebSocket handler, DTOs
application/   GameService (transaction boundary + the claim), InviteService,
               AuthService, PushService
domain/        GameRules interface + 4 implementations. PURE.
               No Spring, no JDBC, no annotations.
persistence/   Repositories, Flyway migrations
```

**The rule that matters:** `domain/` has zero framework dependencies. Rules are
pure functions over immutable state. That is what makes them exhaustively
testable in milliseconds, and what keeps game logic out of the concurrency
machinery.

### The game interface

```java
public interface GameRules<S, M extends Move> {
    SeatRange      seats();                                // legal player counts
    S              initialState(Config config);
    void           validate(S state, Seat seat, M move);   // throws IllegalMove
    Outcome<S>     apply(S state, Seat seat, M move);      // → newState + turn advance
    boolean        isTerminal(S state);
    Optional<Seat> winner(S state);                        // empty = draw or tie
    JsonNode       viewFor(S state, Seat viewer);          // redaction
}

record SeatRange(int min, int max) { }
record Outcome<S>(S state, TurnAdvance turn) { }

sealed interface TurnAdvance {
    record Same()        implements TurnAdvance { }  // same player moves again
    record Next()        implements TurnAdvance { }  // engine resolves rotation
    record To(Seat seat) implements TurnAdvance { }  // explicit; rare
}
```

`apply` returns a turn *advance* rather than flipping automatically — Dots and
Boxes requires the same player to move again after completing a box, and
Battleship after a hit.

### Seat count is a variable

A game runs with `N` seats, where `N` is whatever was accepted at start and is
within `seats()`. It is fixed at **start**, not at creation — the lobby is open
until the creator closes it (§4). **Nothing outside the engine knows `N`.** The
engine owns turn order and resolves `Next` as the next index in the rotation, modulo the seat count.

Rules therefore never name the opponent — Dots and Boxes returns `Same` when a
box was completed and `Next` otherwise, and is correct at any seat count
without change. There is no `Seat.other()` anywhere in the codebase; that is
the single rule that keeps the engine honest about `N`.

Where a move must name a target — a shot in three-player Battleship — the
target seat is part of the move payload, never inferred.

`winner` returns one seat, or empty for a draw or a multi-way tie. Per-seat
scores live in the game state and surface through `viewFor`; the engine does
not model rankings.

`viewFor` is on the interface from day one rather than bolted on for
Battleship. Redaction is a server-side concern; a client that "just does not
render it" is a leak.

### Stack

| Concern | Choice |
|---|---|
| Language | Java 21 — records, sealed interfaces for move types, virtual threads |
| Framework | Spring Boot 3.x |
| Database | Postgres 16 |
| Migrations | Flyway |
| Push | Spring WebSocket, **push-only** |
| Tests | JUnit 5, AssertJ, Testcontainers |
| Metrics | Micrometer → Prometheus → Grafana |

**WebSocket is push-only in v1.** Every mutation goes through REST. One write
path means one place where the invariants are enforced, and it stops the
socket becoming a second, weaker API.

### 7.1 Auth — the thin slice

Bounded on purpose. In scope: register, log in, bcrypt hashes, a signed token,
a filter that resolves it to a player. Out of scope: everything in §3. If this
takes more than a few days, cut it to the bone and move on — it is a
precondition for the project, not part of it.

---

## 8. Interface contract

Routes, payload shapes and status codes are **deferred to implementation**.
What follows is what the interface has to guarantee, whatever shape it takes.

- **One write path.** Every mutation goes over the request/response API. The
  push channel is push-only (§7), so transitions are authorised in one place.
- **Every read is a view, never the state.** A player receives the output of
  `viewFor` for their own seat, never raw game state (C5).
- **Every response carries the version**, and every write claims against the
  version the caller last read. That is what makes the claim (§6) usable from a
  client without a separate read-modify-write round trip.
- **Every write carries a client-supplied idempotency key**, so a retry after a
  timeout is never a second action (C1).
- **A conflict returns the current view, not just an error.** Losing a race is
  ordinary rather than exceptional, so the loser gets everything needed to
  reconcile and decide again in the same response.
- **Reads never depend on a live connection** (C6). Push is a convenience;
  anything renderable is fetchable.

**The lobby race is a feature.** If the creator starts the game while a fourth
invitee is mid-accept, one claims the version and the other is told it lost. If
the accept won and it was the last pending seat, the game is already `ACTIVE`
and the creator's client simply renders it. If seats remain, the creator sees a
fuller lobby and decides again. No extra mechanism — it is the same claim as
everything else.

---

## 9. Game catalogue

| Game | What it contributes | Cost | Ships |
|---|---|---|---|
| **Tic-tac-toe** | Proves the interface. Becomes the trivial fixture for engine and concurrency tests, so those never depend on complicated rules. | An afternoon | **No** — internal and test-only |
| **Dots and Boxes** | The headline. The chain rule (complete a box → move again) means turn-passing is not alternation. The one-line-completes-two-boxes case is the bug everyone ships. | ~2 days | Yes |
| **Connect 4** | Cheapest generalisation check: different board, gravity, line-based win detection. Pure plugin — if it is not an evening, §7's abstraction has leaked. | An evening | Yes |
| **Battleship** | Hidden state, forcing `viewFor` to be real. **Not a plugin:** simultaneous ship placement means nobody whose turn it is during setup, so it changes the engine state machine. See §11. | ~3 days, incl. engine change | Yes |

Only Connect 4 is a fair test of G-2's "pure plugin" claim, because only it adds
a new board without adding a new *kind* of problem.

**Legal seat counts** (declared by each rules class via `seats()`):

| Game | Seats |
|---|---|
| Tic-tac-toe | `2` |
| Connect 4 | `2` |
| Battleship | `2..4` — a shot names its target seat |
| Dots and Boxes | `2..6` — the multi-player variant is a real game |

All four ship playable at 2. **Dots and Boxes at 3+ is the demonstration that
the engine is not secretly two-player**, and it costs nothing beyond a seat
count in the create call — the rules class is unchanged.

**Dots and Boxes representation.** For an `R × C` grid of dots: `R×(C-1)`
horizontal edges, `(R-1)×C` vertical edges, `(R-1)×(C-1)` boxes. Two bitsets
for edges, one byte array for box ownership. A move is `(H|V, row, col)`.

---

## 10. Milestones

Each phase ends in something demonstrable. Nothing moves to the next phase
with a red test.

| # | Phase | Exit criteria |
|---|---|---|
| **M0** | Skeleton | Spring Boot + Postgres + Flyway boot clean. Health check. CI runs tests on push. |
| **M1** | Engine | `GameRules` + tic-tac-toe. Pure unit tests, no database. |
| **M2** | The claim | Schema designed and migrated. Optimistic claim. **C1 and C3 green** — written red first. |
| **M3** | Accounts & lobby | Register, log in, open a lobby, invite by username, accept/decline. Auto-start on the last accept; creator start or cancel otherwise. Seats renumber at start. **C7 and C8 green.** |
| **M4** | Dots and Boxes | Chain rule including the double-box case. Scoring, terminal detection. Correct at 2 seats *and* at 4, with no rules change. C4 green. |
| **M5** | Playable | WebSocket push + thin canvas frontend. Two browsers finish a real game. C6 green. |
| **M6** | Generalisation | Connect 4 (an evening). Battleship with `SETUP` phase. **C5 green.** |
| **M7** | Deployed | Public HTTPS URL, seeded demo account, two devices confirmed. |
| **M8** | Measured | Micrometer → Prometheus → Grafana. Bot load generator. Find where it falls over. |
| **M9** | Written up | README trade-offs, plus one failure found in M8 with before/after graphs. |

M8 is where the project earns its claim. M9 is the artifact that gets read.

---

## 11. Risks

**Battleship's setup phase does not fit the turn model.** Both players place
ships *simultaneously*, so nobody whose turn it is during `SETUP`. It needs a
per-seat `ready` flag and a transition to `ACTIVE` when both are set — which is
itself a race worth testing. Design this before writing it; do not discover it
mid-implementation.

**Auth expands.** The failure mode is three weeks of session handling and a
password reset flow. Mitigation: §7.1 and §3 are the contract. Timebox it.

**Four games is a real cost.** Tic-tac-toe and Connect 4 are cheap. Dots and
Boxes and Battleship are not. If the schedule slips, Connect 4 is the one to
cut — it proves the least.

**Frontend creep.** Every hour spent on animation is an hour not spent on the
part being evaluated. A board and click handlers is the whole brief.

---

## 12. Reversibility

What the remaining non-goals in §3 cost to undo later.

| Deferred | Cost to add later | Why |
|---|---|---|
| **Single player vs the computer** | **Low — and first in the queue after v1** | A bot is a player. It holds a seat and submits moves through the public API; the engine cannot tell the difference. Only move *selection* is new, and it is per game. See below. |
| **Spectators** | Low | `viewFor` already takes a viewer. A spectator is a viewer holding no seat. |
| **Removing a dropped player** | Medium | The remaining players agree to drop an absent seat and continue. Rotation must skip it, and the removal must be an **entry in the log**, not a mutation of `games` — otherwise replay no longer reproduces the real turn sequence and C3 breaks. Because of `TurnAdvance`, it lands in the engine only; no rules class changes. |
| **Teams** | High | the winner becomes a group, scoring becomes per-team, `viewFor` becomes per-team. Not hedged. |
| **Joining in progress** | High | Seats, and therefore the initial state, are fixed at start. A late join would renumber seats over a non-empty move log and invalidate replay (C3). |
| **Real-time / tick loop** | Very high | A different system. Do not grow this one into it. |

**Variable seat count is deliberately absent from this list.** It is built in
from day one (§7), because retrofitting it would have meant editing every rules
class at once, while building it in costs one column and a modulo.

### Single player vs the computer — the first post-v1 feature

Deliberately **not** in v1, but recorded now because the v1 design has to leave
room for it, and because the bot client *is* M8's load generator — one piece of
work, two deliverables.

- A player account flagged as a bot, whose seat is accepted at invite time so it
  never leaves a lobby pending. A game whose only invitee is a bot therefore
  **auto-starts immediately** (§4) — single-player needs no new start path.
- It plays **out of process, through the public REST + WebSocket API**. If a bot
  can play using only the public API, the API is complete.
- Its idempotency key is derived: `clientMoveId = uuid(gameId, seq)`. A bot that
  receives a duplicate update notification and fires twice is deduplicated by C1
  automatically — it cannot double-move.
- It chooses from `viewFor(state, itsSeat)`, never raw state. C5 is what makes a
  *fair* bot possible; a bot reading raw state is cheating at Battleship.
- One optional interface, separate from `GameRules`:

  ```java
  interface GameAi<S, M extends Move> {
      M chooseMove(S view, Seat seat, Difficulty difficulty);
  }
  ```

- Only the search is new work, and it is per game: exhaustive minimax for
  tic-tac-toe, alpha-beta for Connect 4, probability density for Battleship,
  chain-and-loop theory for Dots and Boxes (genuinely deep — start greedy).

---

## 13. Definition of done — v1

- [ ] Four games implemented; three playable in the UI
- [ ] Dots and Boxes playable at 4 seats, with the rules class unchanged from 2
- [ ] C1–C8 each have a named, passing test
- [ ] `ConcurrentMoveTest`: 50 concurrent submissions → exactly 1 accepted, 49 rejected, 1 log row
- [ ] Public HTTPS URL; two people complete a game from separate devices
- [ ] Grafana dashboard: move throughput, p99 move latency, conflict rate, replay-divergence count (must be 0)
- [ ] README stating the trade-off chosen and why
- [ ] One write-up: a failure found under load, with before/after graphs

---

## 14. Open questions

- **Move timeouts** — in v1, a player who stops playing stalls the game for
  everyone, because removing them is deferred (§12). So does a stalled game
  expire, and after how long? A timeout is the only answer available in v1.
  Would introduce a scheduled reaper: a small, honest taste of distributed
  scheduling.
- **Rematch** — a new game, or a linked series?
- **Two nodes?** — does v1 need a second node, or is single-node with the claim
  mechanism proven enough for the resume claim?
