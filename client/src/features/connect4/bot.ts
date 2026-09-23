import { COLS, drop, legalColumns, winningLine, type Board } from './rules'

// Centre columns are part of more possible lines, so they are worth more.
const PREFERENCE = [3, 2, 4, 1, 5, 0, 6]

const wins = (board: Board, col: number, seat: number) => {
  const { board: next, row } = drop(board, col, seat)
  return winningLine(next, row, col).length > 0
}

/**
 * A stand-in opponent until real players move over the network. Not strong,
 * just sensible: take a win, block a loss, don't set up the opponent's win,
 * otherwise prefer the centre with a little randomness.
 */
export function chooseColumn(board: Board, me: number): number {
  const them = 1 - me
  const legal = legalColumns(board)

  const winning = legal.find((c) => wins(board, c, me))
  if (winning !== undefined) return winning

  const blocking = legal.find((c) => wins(board, c, them))
  if (blocking !== undefined) return blocking

  // Avoid moves that let the opponent win by playing on top of ours.
  const safe = legal.filter((c) => {
    const { board: next } = drop(board, c, me)
    return !legalColumns(next).some((reply) => wins(next, reply, them))
  })
  const pool = safe.length ? safe : legal

  const ranked = PREFERENCE.filter((c) => pool.includes(c))
  // Mostly the best-ranked column, sometimes the runner-up, so games vary.
  const pick = Math.random() < 0.7 ? 0 : Math.min(1, ranked.length - 1)
  return ranked[pick] ?? pool[Math.floor(Math.random() * pool.length)] ?? Math.floor(COLS / 2)
}
