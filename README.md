# Turn-Based Game Server

An asynchronous multiplayer game server in the shape of iMessage/GamePigeon.
Invite people by username, take turns in rotation, and the game survives any of
you being offline for days. The server is authoritative — clients submit
*intent*, never state.

Four games (Dots and Boxes, Connect 4, Battleship, tic-tac-toe) run on one
shared engine. The games are deliberately simple.

> **Status: project definition.** No implementation yet — M0 has not started.
> The full definition is in [PROJECT.md](PROJECT.md). Nothing below claims to
> work today; sections marked *pending* are the checklist.

---

## Why this exists

Turn-based games look trivial and aren't. The moment two people can act at
once — and the moment a phone retries a request it already sent — you need the
same machinery a payments ledger needs: exactly-once application, a total
order, and a way to prove you got it right.

This project is built around that, not around the games. The deliverable is a
set of stated invariants, each with a test that would fail loudly if the
guarantee broke.

## The guarantees

| | Guarantee | Test |
|---|---|---|
| **C1** | **Exactly-once** — no two accepted moves share a sequence number; a retry under the same idempotency key applies at most once | `ConcurrentMoveTest` |
| **C2** | **Turn integrity** — a move is accepted only from the seat whose turn it is, at the version it claimed against | `TurnIntegrityTest` |
| **C3** | **Replay equivalence** — the log is gapless, and replaying it reproduces the stored state exactly | `ReplayInvariantTest` |
| **C4** | **Legality** — no accepted move breaks its game's rules; a rejected move leaves zero trace | per-game `RulesTest` |
| **C5** | **Confidentiality** — a player never receives a field the rules hide from them | `HiddenStateTest` |
| **C6** | **Durability** — full state is recoverable by an authenticated read, with no live connection | `ColdResumeTest` |
| **C7** | **Authorization** — a player can only read or act on games they hold a seat in | `AuthorizationTest` |
| **C8** | **Start integrity** — a game leaves the lobby exactly once, however many accepts, starts and cancels race | `ConcurrentStartTest` |

The headline one is **C1**: fire 50 threads at the same game at the same
version, and assert exactly one acceptance, forty-nine rejections, and exactly
one move recorded at that sequence number.

---

## Trade-offs, and why

The decisions that shaped the design, including what each one costs.

### Optimistic concurrency, not locking

Every state transition is a compare-and-swap on the game's version. The caller
sends the version it last read; the write applies only if the game is still
there.

*Why:* no lock is ever held across a network call. Someone who opens a game and
walks away holds nothing.
*Costs:* callers have to handle conflict and decide again, and the version has
to travel to the client and back.
*Rejected:* `SELECT … FOR UPDATE`, which keeps a transaction open for the
lifetime of a request and serialises players who aren't actually in conflict.

### The move log is truth; state is a cache

Games store a derived state, but the append-only log of moves is authoritative.

*Why:* divergence becomes **detectable** (C3) instead of silent. A state-only
design lets one bad write corrupt a game permanently, with no way to notice or
recover.
*Costs:* two representations to keep consistent, and more storage.

### One write path

All mutations go over request/response. The push channel is push-only.

*Why:* transitions are authorised in exactly one place. A bidirectional socket
API means the same authorization logic in a second, less-exercised path — which
is where the bug will be.
*Costs:* a little more write latency, and two channels to manage.

### Variable seat count from day one

The engine knows only that players take turns; how many is per-game config. No
`Seat.other()` exists anywhere — rules return "same player again" or "next",
and the engine owns rotation.

*Why:* retrofitting N players would mean changing every rules class at once.
*Costs:* a modulo and one extra piece of state where a boolean would have done.

### A pure domain layer

Game rules are pure functions over immutable state, with zero framework
dependencies — no Spring, no persistence, no annotations.

*Why:* rules test exhaustively in milliseconds without a container, and game
logic stays out of the concurrency machinery.
*Costs:* mapping between domain and storage types.

---

## The games

| Game | What it contributes | Seats |
|---|---|---|
| Tic-tac-toe | Proves the interface; the trivial fixture for engine tests | 2 |
| **Dots and Boxes** | The chain rule — complete a box, move again — so turns aren't alternation | 2–6 |
| Connect 4 | The generalisation check: new board, no new *kind* of problem | 2 |
| Battleship | Hidden state, and a simultaneous setup phase that changes the engine | 2–4 |

Tic-tac-toe is internal and never ships to users.

**Dots and Boxes at four seats, with the rules class unchanged from two**, is
the proof that the engine isn't secretly two-player.

## Architecture

```
transport/     request handling, push, DTOs
application/   the claim, transaction boundaries, lobby
domain/        GameRules + implementations. PURE — no framework.
persistence/   repositories, migrations
```

Adding a game must not require touching anything but `domain/`. If it does, the
abstraction has leaked. (Battleship is the one declared exception — see
[PROJECT.md §11](PROJECT.md).)

How the layers fit together, what a request does on its way through them, and
which of those choices the guarantees depend on: [ARCHITECTURE.md](ARCHITECTURE.md).

**Stack:** Java 21, Spring Boot 3, Postgres, Flyway, JUnit 5 + Testcontainers,
Micrometer → Prometheus → Grafana.

## Running it

*Pending — implementation starts at M0.* This section will carry clone, build
and run steps plus a seeded demo account.

## Live demo

*Pending — M7.*

## Benchmarks

*Pending — M8.* Deliberately empty rather than aspirational: no throughput or
latency number appears here until it comes off a dashboard.

---

## Roadmap

| | | |
|---|---|---|
| M0 | Skeleton | Boots clean, CI green |
| M1 | Engine | `GameRules` + tic-tac-toe, pure unit tests |
| M2 | The claim | Optimistic claim; **C1 + C3 green**, written red first |
| M3 | Accounts & lobby | Invite, accept/decline, auto-start or creator start |
| M4 | Dots and Boxes | Chain rule, double-box case, scoring |
| M5 | Playable | Push + thin canvas UI; two browsers finish a game |
| M6 | Generalisation | Connect 4, then Battleship + hidden state |
| M7 | Deployed | Public URL, two devices |
| M8 | Measured | Metrics, load generator, find the failure |
| M9 | Written up | Trade-offs + one failure with before/after graphs |

First thing after v1: **single player vs the computer**. A bot is just a player
that holds a seat and plays through the public API — which doubles as proof the
API is complete, and as the load generator.

---

## Documents

- **[PROJECT.md](PROJECT.md)** — the full project definition: scope, non-goals,
  domain model, guarantees, milestones, risks and reversibility.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — how the backend is built: layers,
  the claim, the write path, the log, replay, push, errors and testing.
