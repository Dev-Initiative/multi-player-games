# Architecture — Backend

**Status:** design, no code yet · **Last updated:** 2026-09-21
**Scope:** the server. The frontend is out of scope here by intent — it renders
a board and submits intent, and nothing in this document depends on it.

---

## 1. What this document is

[README.md](README.md) says what the system is and which trade-offs were taken.
[PROJECT.md](PROJECT.md) says what it must guarantee and in what order it gets
built. This document says **how the backend is put together**: the layers, the
path a request takes, where the transaction begins and ends, and which of those
choices are load-bearing for the guarantees `C1`–`C8`.

It is written to be read before M0, and to be the thing that is argued with
when an implementation detail disagrees with it.

Two rules for reading it:

- Where it says **must**, a guarantee depends on it. Breaking it breaks a named
  test.
- Where it says *deferred*, the decision is genuinely open and belongs to the
  milestone that meets it. Those are collected in §14.

---

## 2. Layers, and the one dependency rule

```
transport/     REST controllers, WebSocket handler, DTOs, error mapping
application/   GameService, LobbyService, AuthService, PushService,
               ReplayService — transaction boundaries and the claim
domain/        GameRules + implementations, Seat, Move, Outcome. PURE.
persistence/   repositories, Flyway migrations, JSON codecs
```

**Dependencies point one way only:**

```
transport ──▶ application ──▶ domain
                    │
                    └───────▶ persistence ──▶ domain
```

`domain/` depends on nothing in this list, and on no framework at all. Nothing
depends on `transport/`.

**Why it matters more than it looks.** G-2 claims that adding a game touches
only `domain/`. That claim is only checkable if the dependency direction is
enforced rather than intended — so it is enforced by a test (§12), not by
discipline.

---

## 3. The domain layer

The interface is fixed in [PROJECT.md §7](PROJECT.md). What follows are the
constraints on implementing it.

### Purity is a hard requirement, not a style preference

A rules implementation **must** be a pure function of its arguments:

- **No clock.** No `Instant.now()`, no `LocalDate`, no elapsed-time logic.
- **No randomness.** No `Random`, no `UUID.randomUUID()`, no hash-order
  iteration over `HashMap`/`HashSet` where the order can reach the result.
- **No I/O, no Spring, no JPA annotations, no logging framework.**
- **No mutation.** State types are records over immutable collections; `apply`
  returns a new state and never edits its argument.

**Why:** `C3` says replaying the log reproduces the stored state *exactly*. A
replay runs at a different time, in a different process, possibly months later.
Any impurity makes the replay result a function of when you ran it, and the
invariant becomes unfalsifiable — the worst outcome, because the dashboard goes
on reading zero while the property is gone.

If a future game needs randomness — dice, a shuffled deck — the seed is drawn
once by `application/` at game creation, stored in the immutable config, and
passed into `initialState`. Rules stay deterministic given the config; the
non-determinism lives in the log, where replay can find it.

### State serialisation

Domain state crosses into storage as JSON. Two consequences:

- **Round-tripping must be lossless and total.** `deserialize(serialize(s))`
  equals `s` for every reachable `s`. That is a property test in M1, not a hope.
- **"Equals" is defined on the domain type, not on the bytes.** `C3` compares
  `replay(log)` to `deserialize(storedState)` using record equality. Comparing
  serialised text would promote key order and number formatting into
  correctness bugs, which they are not.

### What the engine owns instead of the rules

Rules never see the seat count, never name an opponent, and never decide whose
turn is next — they return a `TurnAdvance` and the engine resolves it against
the rotation. There is no `Seat.other()` anywhere in the codebase. That is what
makes Dots and Boxes correct at six seats with the same class that runs at two.

---

## 4. The claim

Every state transition — accept, decline, start, cancel, move, resign — is the
same operation: **a compare-and-swap on the game version**.

```sql
UPDATE games
   SET state = ?, version = version + 1, current_seat = ?,
       status = ?, move_count = move_count + 1
 WHERE id = ? AND version = ?
```

Zero rows affected means the caller lost. Nothing else needs checking, and
there is exactly one place in the codebase that issues this statement.

### Why READ COMMITTED is enough

Worth understanding before writing it, because it looks like it needs
`SERIALIZABLE` and does not.

Two transactions both read version 5 and both compute a next state. Both then
issue the `UPDATE`. The first takes the row lock and commits. The second
**blocks on that lock**, and when it is released Postgres re-evaluates the
`WHERE` clause against the newly committed row — where `version` is now 6. The
predicate fails, zero rows are affected, and the loser rolls back having
changed nothing.

The lock is held for one short statement inside one short transaction, never
across a network call. That is the whole difference from `SELECT … FOR UPDATE`,
which would hold it from the read to the write — that is, for as long as a
player takes to think.

### The claim is the serialisation point

Because at most one transaction can win the CAS for a given version, everything
else inside that transaction is effectively serialised per game. That is what
makes it safe to allocate a sequence number from a counter (§6) rather than by
holding a separate lock or reaching for a database sequence.

The unique constraints in §7 are not the mechanism. They are the **backstop**:
if the mechanism is ever wrong, they turn silent corruption into a loud
constraint violation.

---

## 5. The write path, end to end

A move, `POST /games/{id}/moves`, carrying `{ version, idempotencyKey, move }`.

**Outside the transaction:**

1. The auth filter resolves the bearer token to a `Player`, or 401.
2. The controller binds the DTO and asks the game type codec to parse the move
   into the sealed `Move` subtype for that game. A payload that does not parse
   is 400 and never reaches `application/`.

**Inside one transaction** (`GameService.submitMove`, the only `@Transactional`
boundary on this path):

3. Load the game row with a plain `SELECT`. No `FOR UPDATE`.
4. **Authorize** — the player holds a seat in this game, else 404 (§10).
5. **Idempotency** — look up `(game_id, idempotency_key)` in the log. On a hit,
   return the recorded outcome and **write nothing** (`C1`).
6. **Preconditions, in memory** — status is `ACTIVE`, the submitted version
   matches the loaded row, and the player seat is `current_seat` (`C2`).
7. **Deserialize** state and hand it to the rules.
8. `rules.validate(state, seat, move)` — on `IllegalMove`, throw. The
   transaction rolls back, **leaving no log row and no version bump** (`C4`).
9. `rules.apply(...)` returns the new state and a `TurnAdvance`; the engine
   resolves the next seat. `isTerminal` decides whether status becomes
   `FINISHED`, and `winner` fills the winning seat.
10. **The claim** (§4). Zero rows affected → conflict → rollback → 409.
11. **Append the log entry** at `seq = move_count`, as bumped in step 10.

**After commit:**

12. `PushService` notifies the other seats that are currently connected.
13. The response carries the redacted view for the mover, and the new version.

### Push fires after commit. Never inside.

Step 12 is registered as an after-commit callback
(`@TransactionalEventListener(phase = AFTER_COMMIT)`), not called inline.

**Why:** a push sent inside the transaction is a push that can be followed by a
rollback. Clients would render a move that does not exist, and the only way
back is a reload they have no reason to perform. The ordering is a correctness
property, not a tidiness one.

### Order within the transaction

The claim (10) comes before the log append (11). Either order is *correct*
given the constraints, but claiming first means a loser does no insert work it
is about to discard, and it keeps "who won the race" resolved in one place.

---

## 6. The log

### Entries, not just moves

The log is the authoritative, append-only record. Its rows are **log entries**
carrying a `kind`, of which a move is one:

| Kind | Written when | Carries |
|---|---|---|
| `MOVE` | a move is accepted | the move payload and its effect |
| `RESIGN` | a player resigns | the resigning seat |
| `ABANDON` | a stalled game expires (open — §14) | the trigger |

**Why this is not "moves plus a status column".** `C3` says replaying the log
reproduces the stored state exactly. If resigning sets `games.status` directly
without an entry, replaying a resigned game yields an `ACTIVE` game with no
winner, and the invariant is false for every game that ended that way.
[PROJECT.md §12](PROJECT.md) already makes this argument for the deferred
drop-a-player feature; resignation is in v1 and needs it now.

Start and cancel are `WAITING` transitions that happen while the log is still
empty, so they are not entries. The log begins at the first move of an `ACTIVE`
game, and the state it starts from is fully determined by the config and the
seat count fixed at start.

### Sequence allocation

`seq` is allocated from the `move_count` the claim just incremented, in the
same transaction. Gaplessness is therefore structural: a sequence number exists
only because a claim succeeded, and exactly one claim can succeed per version.

`UNIQUE (game_id, seq)` and `UNIQUE (game_id, idempotency_key)` enforce `C1` at
the storage layer regardless.

### The starting point must stay pinned

Replay starts from `initialState(config)` at `N` seats. Both inputs freeze once
the first entry exists:

- **Seats** are renumbered at start and never afterwards
  ([PROJECT.md §5](PROJECT.md)).
- **Config** is written at creation and never updated. An edit to a game config
  is indistinguishable, in its effect on replay, from renumbering a seat.

### Finished games keep their log

The retention decision lives in [PROJECT.md §5](PROJECT.md). Architecturally:
the `state` column is the disposable copy and the log is not, so nothing in
this design may delete entries for a finished game. The log is also immutable
once the game ends, which is what lets the replay response be cached hard (§8).

---

## 7. Storage shape

Implemented by
[V1__initial_schema.sql](src/main/resources/db/migration/V1__initial_schema.sql).
What the architecture requires, and what that migration does, is enforce these
**structurally** rather than in application code:

| Table | Holds | Constraints that carry a guarantee |
|---|---|---|
| `players` | account, unique username, password hash, bot flag | `UNIQUE (username)` |
| `games` | type, immutable config, status, **version**, `current_seat`, `seat_count`, `move_count`, materialised `state`, winner | — |
| `seats` | seat index, player, lobby acceptance state | `PK (game_id, seat_index)`, `UNIQUE (game_id, player_id)` → a player cannot hold two seats |
| `log_entries` | kind, seat, payload, effect, idempotency key | `PK (game_id, seq)` → `C1`/`C3`; `UNIQUE (game_id, idempotency_key)` → `C1` |

`version` and `move_count` are separate on purpose: lobby transitions bump the
version before any log exists, so the two are not interchangeable.

**The effect column** stores what the entry did — completed boxes, scores
after, resulting turn. It is derived data, and keeping it is what lets a replay
be served without re-running the rules engine per request (§8).

---

## 8. Reads, redaction and replay

### Every read is a view

A response **never** contains raw game state. It contains `viewFor(state,
viewer)` for the seat making the request (`C5`). That holds for the game read,
the push payload and the replay alike — there is no path that returns state, so
there is no path that can forget to redact.

A read requires no live connection and no in-memory session: the game row plus
the seat rows are everything needed to render (`C6`).

### Replay

`GET /games/{id}/replay` returns the log as **annotated deltas** — an entry
plus what it did, already redacted for the requesting seat:

```json
{ "seq": 3, "seat": 0, "move": {"edge": [2,3]},
  "completed": [[1,1]], "scores": [1,0], "nextTurn": 0 }
```

Three properties follow, and each one is the reason for the shape:

- **The client never implements the rules.** The chain rule exists once, in
  Java. A JavaScript re-implementation would be a second rules engine that
  `C3` cannot check, because `C3` only ever compares the server to itself.
- **Hidden state never leaves the server.** Raw entries are not safe to ship: a
  Battleship setup payload *is* the fleet position. A delta reports
  `hit`/`miss`/`sunk`, which is what the viewer is entitled to.
- **It is the same payload the push channel sends** (§9), so one client
  renderer drives both live play and replay, differing only in where the timing
  comes from.

Replay is a **read**, so it is served over REST like every other read, and the
socket stays push-only. Volumes are small — a Dots and Boxes game is
`2mn + m + n` entries, so 84 for a 6×6 board, a few KB — and a finished log is
immutable, so the response carries an `ETag` and `Cache-Control: immutable`.

*If* a board ever makes a single response uncomfortable, the escape hatch is
progressive delivery on the same endpoint: NDJSON from a
`StreamingResponseBody`, one entry per line, so the client animates entry 1
without waiting for the last — or `?from=&limit=` if discrete pages are
preferred. Both keep reads on REST, cacheable and testable with MockMvc.
Neither is built in v1.

---

## 9. Push

- **Push-only.** The socket carries no mutations and serves no reads. One write
  path and one read path, each authorised in exactly one place.
- **The payload is the annotated delta** from §8, redacted per recipient seat.
- **Best-effort, never authoritative.** A dropped socket costs a notification,
  not a move. Any client recovers the full truth with an ordinary authenticated
  GET (`C6`).
- **It carries the resulting version**, so a client that receives a duplicate or
  out-of-order notification reconciles by version rather than by trusting
  arrival order.
- **Idempotency covers the rest.** A bot or client that reacts twice to the same
  notification submits the same idempotency key twice and is deduplicated by
  `C1` — it cannot double-move.

---

## 10. Error model

| Situation | Status | Body |
|---|---|---|
| Malformed payload, unparseable move | 400 | field errors |
| Missing or invalid token | 401 | — |
| Game exists, caller holds no seat | **404** | — |
| Version stale, or lost a race | **409** | **the current view + version** |
| Well-formed move, refused by the rules | **422** | the rule that refused it |
| Action not allowed in this status, or not by this seat | 409 | current view |

Three deliberate choices:

- **404, not 403, for a game you hold no seat in.** A 403 confirms the game
  exists. `C7` is about what a player can learn, not only what they can change.
- **409 and 422 mean different things to a client.** 409 says *your view was
  stale — reconcile and decide again*, and the same move may well succeed. 422
  says *that move is illegal*, and retrying it is pointless. Collapsing them
  into one status pushes the distinction into a string, and clients start
  parsing messages.
- **A conflict returns the current view.** Losing a race is ordinary rather than
  exceptional, so the loser gets everything needed to decide again without a
  second round trip.

---

## 11. Auth and the runtime

**Auth is a thin slice**, bounded by [PROJECT.md §7.1](PROJECT.md): register,
log in, bcrypt, a signed token, and a filter that resolves it to a player. The
only job of that filter is producing a `Player` for `application/` to authorize
against. No authorization decision lives in `transport/`.

**Virtual threads** carry requests. One caution to take into M8: the bottleneck
is the JDBC pool, not the threads. Virtual threads make it trivial to have ten
thousand requests in flight against a pool of twenty connections, and a
blocking driver can pin carrier threads. Size the pool deliberately and measure
it — this is exactly the kind of failure M8 exists to find.

**No shared mutable state between requests.** No in-memory game cache, no
session affinity. Two nodes behind a load balancer must behave identically to
one, because the only coordination is the row in Postgres.

---

## 12. Testing

| Layer | How | Speed |
|---|---|---|
| `domain/` | plain JUnit, no Spring context, no database | milliseconds |
| the claim | Testcontainers Postgres, real concurrency | seconds |
| `transport/` | MockMvc | fast |
| layering | ArchUnit | instant |

**`ConcurrentMoveTest` is the headline.** Fifty virtual threads, one game, one
version, released together on a latch. Assert exactly one acceptance,
forty-nine 409s, and exactly one row at that sequence number. Written red
first, against the unfixed implementation.

**`ReplayInvariantTest` is best written as a property test.** Generate random
legal games, replay each log from `initialState(config)`, and compare to the
stored state by record equality. Random games find what a hand-written fixture
does not — particularly the double-box case.

**ArchUnit is what makes G-2 falsifiable.** Assert that no class in `domain/`
depends on `org.springframework`, `jakarta.persistence`, `com.fasterxml` or
`java.time.Clock`, and that the layer arrows in §2 hold. Without it, "adding a
game touches only `domain/`" is an assertion. With it, it is a failing build.

---

## 13. Observability

Per move: a timer for latency, and counters for accepted and for rejected by
reason (`conflict`, `illegal`, `not-your-turn`, `idempotent-replay`). The
conflict rate is the interesting number — it is the price of the optimistic
choice, and M8 is where it gets a value instead of an adjective.

**The replay verifier.** The Definition of Done requires a dashboard panel for
replay divergence reading zero. Something has to produce that number: a
scheduled job that samples games, replays each log from the initial state,
compares against the stored state, and emits the count of mismatches.

It is a small job, and it is what turns `C3` from a test that passed once in CI
into a property that is true of production right now. If it ever reads
non-zero, the log is truth and the state is rebuilt from it — which is the
entire reason the log is truth.

---

## 14. Open, and deferred

**Decisions this document adds** beyond PROJECT.md, which should be ratified
there rather than living only here:

- **Log entries carry a `kind`, and resignation is an entry rather than a
  status write** (§6). Required for `C3` to hold on resigned games.
- **Rules must be deterministic** — no clock, no RNG (§3). The unstated
  precondition of `C3`.
- **`C3` compares domain records, not serialised bytes** (§3).
- **Config is immutable once the first entry exists** (§6).
- **Push fires after commit** (§5).

**Deferred to the milestone that meets them:**

- Index tuning under load — M8. V1 carries only the indexes the known reads
  need, and no more.
- Token format and lifetime — M3.
- The `SETUP` state machine for Battleship, including the per-seat `ready` flag
  and the race it introduces — designed before M6, per
  [PROJECT.md §11](PROJECT.md).
- Move timeouts and the `ABANDON` entry — open in
  [PROJECT.md §14](PROJECT.md).
- Progressive replay delivery (§8) — not until a measurement asks for it.
