import type { GameStatus } from './store'

type Tone = 'brand' | 'neutral' | 'lime' | 'tangerine' | 'sun'

/** How each game status is labelled wherever a badge shows it. */
export const STATUS_BADGE: Record<GameStatus, { label: string; tone: Tone; live?: boolean }> = {
  lobby: { label: 'Invite sent', tone: 'sun' },
  'your-turn': { label: 'Your turn', tone: 'brand', live: true },
  'their-turn': { label: 'Their turn', tone: 'neutral' },
  won: { label: 'Won', tone: 'lime' },
  lost: { label: 'Lost', tone: 'tangerine' },
  draw: { label: 'Draw', tone: 'sun' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}
