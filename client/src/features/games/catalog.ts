import {
  Castle,
  Circle,
  CircleDot,
  Crown,
  Dice5,
  Egg,
  Grip,
  Hash,
  Ship,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { Seat } from '../shared/ui/seat'

export type GameCategory = 'strategy' | 'quick' | 'party'

export type Game = {
  id: string
  title: string
  tagline: string
  players: string
  /** Typical length when both players move promptly. */
  length: string
  category: GameCategory
  icon: LucideIcon
  seat: Seat
  status: 'live' | 'soon'
}

// Placeholder catalog for the design. The server's GameRules implementations
// will eventually be the source of truth for which games exist.
export const GAMES: Game[] = [
  {
    id: 'connect-4',
    title: 'Connect 4',
    tagline: 'Drop discs, line up four before they do.',
    players: '2 players',
    length: '~15 moves',
    category: 'strategy',
    icon: Circle,
    seat: 'tangerine',
    status: 'live',
  },
  {
    id: 'dots-and-boxes',
    title: 'Dots and Boxes',
    tagline: 'Draw lines, close boxes, steal the board.',
    players: '2–4 players',
    length: '~30 moves',
    category: 'party',
    icon: Grip,
    seat: 'lime',
    status: 'live',
  },
  {
    id: 'battleship',
    title: 'Battleship',
    tagline: 'Hide your fleet. Hunt theirs.',
    players: '2 players',
    length: '~40 moves',
    category: 'strategy',
    icon: Ship,
    seat: 'sky',
    status: 'live',
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic-tac-toe',
    tagline: 'Three in a row. Over before lunch.',
    players: '2 players',
    length: '~5 moves',
    category: 'quick',
    icon: Hash,
    seat: 'sun',
    status: 'live',
  },
  {
    id: 'checkers',
    title: 'Checkers',
    tagline: 'Jump, capture, get crowned.',
    players: '2 players',
    length: '~40 moves',
    category: 'strategy',
    icon: Crown,
    seat: 'tangerine',
    status: 'soon',
  },
  {
    id: 'reversi',
    title: 'Reversi',
    tagline: 'Flip the board one disc at a time.',
    players: '2 players',
    length: '~30 moves',
    category: 'strategy',
    icon: CircleDot,
    seat: 'lime',
    status: 'soon',
  },
  {
    id: 'mancala',
    title: 'Mancala',
    tagline: 'Sow the stones, fill your store.',
    players: '2 players',
    length: '~25 moves',
    category: 'quick',
    icon: Egg,
    seat: 'sun',
    status: 'soon',
  },
  {
    id: 'word-grid',
    title: 'Word Grid',
    tagline: 'Build words across a shared board.',
    players: '2–4 players',
    length: '~20 moves',
    category: 'party',
    icon: Type,
    seat: 'sky',
    status: 'soon',
  },
  {
    id: 'dice-duel',
    title: 'Dice Duel',
    tagline: 'Roll, bank, or push your luck.',
    players: '2–6 players',
    length: '~10 rounds',
    category: 'party',
    icon: Dice5,
    seat: 'tangerine',
    status: 'soon',
  },
  {
    id: 'chess',
    title: 'Chess',
    tagline: 'The long game, one move a day.',
    players: '2 players',
    length: '~40 moves',
    category: 'strategy',
    icon: Castle,
    seat: 'sky',
    status: 'soon',
  },
]

export const LIVE_GAMES = GAMES.filter((g) => g.status === 'live')
