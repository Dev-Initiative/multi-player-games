import { useSyncExternalStore } from 'react'
import { replay } from '../connect4/rules'
import type { Seat } from '../shared/ui/seat'

// Stand-in for the server until the API exists. Mirrors its shape: a game is
// its seats plus an append-only move log, and every view is derived by
// replaying that log. Swapping this for API calls should not touch the UI.

export type GameType = 'connect-4'

export type SeatInfo = {
  name: string
  color: Seat
  /** The signed-in player. Exactly one seat has this. */
  isYou?: boolean
}

export type MoveEntry = {
  seq: number
  seat: number
  column: number
  at: number
}

export type GameRecord = {
  id: string
  type: GameType
  seats: SeatInfo[]
  /** Seat that moved first. Rematches alternate it. */
  firstSeat: number
  moves: MoveEntry[]
  resignedBy: number | null
  createdAt: number
  updatedAt: number
}

export type GameStatus = 'your-turn' | 'their-turn' | 'won' | 'lost' | 'draw'

/** Connect 4 colors are fixed by seat so the board always reads the same way. */
export const CONNECT4_COLORS: Seat[] = ['sky', 'sun']

const STORAGE_KEY = 'games.v1'
const HOUR = 3600 * 1000

// --- persistence ----------------------------------------------------------

let cache: GameRecord[] | null = null
const listeners = new Set<() => void>()

function load(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GameRecord[]
  } catch {
    // Unavailable or corrupt storage: start from the seed.
  }
  return seed()
}

function commit(next: GameRecord[]) {
  cache = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Keep the in-memory copy for this tab.
  }
  listeners.forEach((fn) => fn())
}

function snapshot() {
  if (!cache) cache = load()
  return cache
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  // Another tab changed the games: pick it up.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null
      fn()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('storage', onStorage)
  }
}

function update(id: string, change: (game: GameRecord) => GameRecord) {
  commit(snapshot().map((g) => (g.id === id ? change(g) : g)))
}

// --- reading --------------------------------------------------------------

export function useGames() {
  return useSyncExternalStore(subscribe, snapshot)
}

export function useGame(id: string | undefined) {
  return useGames().find((g) => g.id === id)
}

export function position(game: GameRecord) {
  return replay(
    game.moves.map((m) => m.column),
    game.firstSeat,
  )
}

export const yourSeat = (game: GameRecord) => game.seats.findIndex((s) => s.isYou)

export function statusOf(game: GameRecord): GameStatus {
  const you = yourSeat(game)
  if (game.resignedBy !== null) return game.resignedBy === you ? 'lost' : 'won'
  const { winner, draw, currentSeat } = position(game)
  if (winner !== null) return winner === you ? 'won' : 'lost'
  if (draw) return 'draw'
  return currentSeat === you ? 'your-turn' : 'their-turn'
}

export const isFinished = (status: GameStatus) => status === 'won' || status === 'lost' || status === 'draw'

// --- writing --------------------------------------------------------------

const newId = () => Math.random().toString(36).slice(2, 8)

export function createConnect4Game(you: string, opponent: string): string {
  const now = Date.now()
  const game: GameRecord = {
    id: newId(),
    type: 'connect-4',
    seats: [
      { name: you, color: CONNECT4_COLORS[0], isYou: true },
      { name: opponent, color: CONNECT4_COLORS[1] },
    ],
    firstSeat: 0,
    moves: [],
    resignedBy: null,
    createdAt: now,
    updatedAt: now,
  }
  commit([game, ...snapshot()])
  return game.id
}

/** Append a move after checking it is legal, the same checks the server makes. */
export function playMove(id: string, seat: number, column: number) {
  update(id, (game) => {
    const { currentSeat } = position(game)
    if (game.resignedBy !== null || currentSeat !== seat) throw new Error('Not your turn')
    const next = { seq: game.moves.length + 1, seat, column, at: Date.now() }
    // Throws on a full column, so an illegal move never reaches the log.
    replay([...game.moves, next].map((m) => m.column), game.firstSeat)
    return { ...game, moves: [...game.moves, next], updatedAt: next.at }
  })
}

export function resign(id: string, seat: number) {
  update(id, (game) => ({ ...game, resignedBy: seat, updatedAt: Date.now() }))
}

/** Same players, fresh board, the other seat starts. */
export function rematch(id: string): string {
  const old = snapshot().find((g) => g.id === id)
  if (!old) throw new Error('Game not found')
  const now = Date.now()
  const game: GameRecord = {
    ...old,
    id: newId(),
    firstSeat: 1 - old.firstSeat,
    moves: [],
    resignedBy: null,
    createdAt: now,
    updatedAt: now,
  }
  commit([game, ...snapshot()])
  return game.id
}

// --- seed -----------------------------------------------------------------

function seeded(opponent: string, firstSeat: number, columns: number[], hoursAgo: number): GameRecord {
  const end = Date.now() - hoursAgo * HOUR
  const start = end - columns.length * 3 * HOUR
  return {
    id: newId(),
    type: 'connect-4',
    seats: [
      { name: 'You', color: CONNECT4_COLORS[0], isYou: true },
      { name: opponent, color: CONNECT4_COLORS[1] },
    ],
    firstSeat,
    moves: columns.map((column, i) => ({
      seq: i + 1,
      seat: (firstSeat + i) % 2,
      column,
      at: start + ((end - start) * (i + 1)) / columns.length,
    })),
    resignedBy: null,
    createdAt: start,
    updatedAt: end,
  }
}

/** A few games in different states, so the list has something to show on first visit. */
function seed(): GameRecord[] {
  return [
    seeded('Grace Hopper', 0, [3, 3, 4, 2], 2), // your turn
    seeded('Linus T', 0, [3, 2, 2, 4, 5], 20), // their turn
    seeded('Ada Lovelace', 1, [3, 4, 3, 4, 2], 70), // your turn, Ada started
    seeded('Barbara L', 0, [0, 0, 1, 1, 2, 2, 3], 120), // you won, bottom row
    seeded('Grace Hopper', 1, [3, 0, 3, 0, 3, 1, 3], 170), // Grace won, column 4
  ]
}
