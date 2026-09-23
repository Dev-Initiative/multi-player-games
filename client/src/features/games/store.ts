import { useSyncExternalStore } from 'react'
import { CLASSIC, replay as replayConnect4, type Connect4Config } from '../connect4/rules'
import { replay as replayDots } from '../dots/rules'
import type { Seat } from '../shared/ui/seat'

// Stand-in for the server until the API exists. Mirrors its shape: a game is
// its seats plus an append-only move log, and every view is derived by
// replaying that log. Swapping this for API calls should not touch the UI.

export type GameType = 'connect-4' | 'dots-and-boxes'

export type InviteState = 'pending' | 'accepted' | 'declined'

export type SeatInfo = {
  name: string
  username?: string
  color: Seat
  /** The signed-in player. Exactly one seat has this. */
  isYou?: boolean
  /** Lobby answer. Missing means accepted (older games, and the creator). */
  invite?: InviteState
}

export type MoveEntry = {
  seq: number
  seat: number
  /** Game-specific: a column for Connect 4, an edge index for Dots and Boxes. */
  move: number
  at: number
}

/**
 * Lifecycle, as on the server: a game waits in the lobby until every invitee
 * accepts, then plays. A decline or a cancel ends it before it starts.
 */
export type GamePhase = 'lobby' | 'active' | 'cancelled'

export type GameRecord = {
  id: string
  type: GameType
  seats: SeatInfo[]
  /** Seat that moves first. Rematches alternate it. */
  firstSeat: number
  /** Immutable once created: replay starts from it. Connect 4 only for now. */
  config?: Connect4Config
  /** Missing means active (games saved before lobbies existed). */
  phase?: GamePhase
  moves: MoveEntry[]
  resignedBy: number | null
  createdAt: number
  startedAt?: number
  updatedAt: number
}

export type GameStatus = 'lobby' | 'your-turn' | 'their-turn' | 'won' | 'lost' | 'draw' | 'cancelled'

/** The part of any game's position the shared screens need. */
export type Outcome = { currentSeat: number | null; winner: number | null; draw: boolean }

/** Default seat colors per game, so each board reads the same way unless a player picks otherwise. */
export const SEAT_COLORS: Record<GameType, Seat[]> = {
  'connect-4': ['sky', 'sun'],
  'dots-and-boxes': ['sky', 'tangerine', 'lime', 'sun'],
}

export const gamePath = (game: Pick<GameRecord, 'type' | 'id'>) => `/games/${game.type}/${game.id}`

export const phaseOf = (game: GameRecord): GamePhase => game.phase ?? 'active'
export const connect4Config = (game: GameRecord) => game.config ?? CLASSIC

const STORAGE_KEY = 'games.v3'
const OLD_KEYS = ['games.v1', 'games.v2']

// --- rules dispatch -------------------------------------------------------

const moveList = (game: GameRecord) => game.moves.map((m) => m.move)

/** Replay the log with the game's own rules. Throws if the log holds an illegal move. */
export function outcome(game: GameRecord): Outcome {
  switch (game.type) {
    case 'connect-4':
      return replayConnect4(moveList(game), game.firstSeat, connect4Config(game))
    case 'dots-and-boxes':
      return replayDots(moveList(game), game.firstSeat, game.seats.length)
  }
}

// --- persistence ----------------------------------------------------------

let cache: GameRecord[] | null = null
const listeners = new Set<() => void>()

function load(): GameRecord[] {
  try {
    // Drop games saved by earlier versions (including the old example games).
    OLD_KEYS.forEach((key) => localStorage.removeItem(key))
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GameRecord[]
  } catch {
    // Unavailable or corrupt storage: start empty.
  }
  return []
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

/** A game, optionally required to be of one type (so a Dots id can't open on the Connect 4 page). */
export function useGame(id: string | undefined, type?: GameType) {
  return useGames().find((g) => g.id === id && (!type || g.type === type))
}

export const yourSeat = (game: GameRecord) => game.seats.findIndex((s) => s.isYou)

export function statusOf(game: GameRecord): GameStatus {
  const phase = phaseOf(game)
  if (phase === 'lobby') return 'lobby'
  if (phase === 'cancelled') return 'cancelled'
  const you = yourSeat(game)
  if (game.resignedBy !== null) return game.resignedBy === you ? 'lost' : 'won'
  const { winner, draw, currentSeat } = outcome(game)
  if (winner !== null) return winner === you ? 'won' : 'lost'
  if (draw) return 'draw'
  return currentSeat === you ? 'your-turn' : 'their-turn'
}

/** The game was played to a result. */
export const isFinished = (status: GameStatus): status is 'won' | 'lost' | 'draw' =>
  status === 'won' || status === 'lost' || status === 'draw'

/** Nothing more will happen in this game: a result, or cancelled before it began. */
export const isClosed = (status: GameStatus) => isFinished(status) || status === 'cancelled'

/** Moves can be made: someone is on turn. */
export const isInPlay = (status: GameStatus) => status === 'your-turn' || status === 'their-turn'

/** Who won, counting resignations (which the rules alone don't know about). */
export function winnerOf(game: GameRecord) {
  if (phaseOf(game) !== 'active') return null
  if (game.resignedBy !== null) return game.seats.length === 2 ? 1 - game.resignedBy : null
  return outcome(game).winner
}

// --- writing --------------------------------------------------------------

const newId = () => Math.random().toString(36).slice(2, 8)

/** Start immediately, no lobby. Used for games that don't have a setup screen yet. */
export function createGame(type: GameType, you: string, opponents: string[]): string {
  const now = Date.now()
  const colors = SEAT_COLORS[type]
  const game: GameRecord = {
    id: newId(),
    type,
    seats: [
      { name: you, color: colors[0], isYou: true },
      ...opponents.map((name, i) => ({ name, color: colors[i + 1] })),
    ],
    firstSeat: 0,
    phase: 'active',
    moves: [],
    resignedBy: null,
    createdAt: now,
    startedAt: now,
    updatedAt: now,
  }
  commit([game, ...snapshot()])
  return game.id
}

export type Connect4Setup = {
  you: { name: string; username?: string; color: Seat }
  opponent: { name: string; username: string; color: Seat }
  config: Connect4Config
  firstSeat: 0 | 1
}

/** Open a lobby: the game exists, the invite is out, and play starts once it's accepted. */
export function createConnect4Invite(setup: Connect4Setup): string {
  const now = Date.now()
  const game: GameRecord = {
    id: newId(),
    type: 'connect-4',
    seats: [
      { ...setup.you, isYou: true, invite: 'accepted' },
      { ...setup.opponent, invite: 'pending' },
    ],
    firstSeat: setup.firstSeat,
    config: setup.config,
    phase: 'lobby',
    moves: [],
    resignedBy: null,
    createdAt: now,
    updatedAt: now,
  }
  commit([game, ...snapshot()])
  return game.id
}

/** Record an invitee's answer. The last accept starts the game; any decline cancels it. */
export function answerInvite(id: string, seat: number, answer: 'accepted' | 'declined') {
  update(id, (game) => {
    if (phaseOf(game) !== 'lobby') return game
    const now = Date.now()
    const seats = game.seats.map((s, i) => (i === seat ? { ...s, invite: answer } : s))
    if (answer === 'declined') return { ...game, seats, phase: 'cancelled', updatedAt: now }
    const allIn = seats.every((s) => (s.invite ?? 'accepted') === 'accepted')
    return allIn
      ? { ...game, seats, phase: 'active', startedAt: now, updatedAt: now }
      : { ...game, seats, updatedAt: now }
  })
}

/** The creator calls it off before it starts. */
export function cancelGame(id: string) {
  update(id, (game) => (phaseOf(game) === 'lobby' ? { ...game, phase: 'cancelled', updatedAt: Date.now() } : game))
}

/** Append a move after checking it is legal: the same checks the server makes. */
export function playMove(id: string, seat: number, move: number) {
  update(id, (game) => {
    if (phaseOf(game) !== 'active' || game.resignedBy !== null || outcome(game).currentSeat !== seat) {
      throw new Error('Not your turn')
    }
    const entry = { seq: game.moves.length + 1, seat, move, at: Date.now() }
    const next = { ...game, moves: [...game.moves, entry], updatedAt: entry.at }
    // Throws on an illegal move, so one never reaches the log.
    outcome(next)
    return next
  })
}

export function resign(id: string, seat: number) {
  update(id, (game) => ({ ...game, resignedBy: seat, updatedAt: Date.now() }))
}

/** Same players and board, fresh game, the next seat starts. Straight into play: both just played. */
export function rematch(id: string): string {
  const old = snapshot().find((g) => g.id === id)
  if (!old) throw new Error('Game not found')
  const now = Date.now()
  const game: GameRecord = {
    ...old,
    id: newId(),
    seats: old.seats.map((s) => ({ ...s, invite: 'accepted' })),
    firstSeat: (old.firstSeat + 1) % old.seats.length,
    phase: 'active',
    moves: [],
    resignedBy: null,
    createdAt: now,
    startedAt: now,
    updatedAt: now,
  }
  commit([game, ...snapshot()])
  return game.id
}
