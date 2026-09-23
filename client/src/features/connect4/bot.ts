import { drop, legalColumns, winningLine, type Board, type Connect4Config } from './rules'

const wins = (board: Board, col: number, seat: number, c: Connect4Config) => {
  const { board: next, row } = drop(board, col, seat, c)
  return winningLine(next, row, col, c).length > 0
}

/** Columns ordered centre-out: centre columns are part of more possible lines. */
const preference = (cols: number) =>
  Array.from({ length: cols }, (_, i) => i).sort((a, b) => Math.abs(a - (cols - 1) / 2) - Math.abs(b - (cols - 1) / 2))

/**
 * A stand-in opponent until real players move over the network. Not strong,
 * just sensible: take a win, block a loss, don't set up the opponent's win,
 * otherwise prefer the centre with a little randomness.
 */
export function chooseColumn(board: Board, me: number, c: Connect4Config): number {
  const them = 1 - me
  const legal = legalColumns(board, c)

  const winning = legal.find((col) => wins(board, col, me, c))
  if (winning !== undefined) return winning

  const blocking = legal.find((col) => wins(board, col, them, c))
  if (blocking !== undefined) return blocking

  // Avoid moves that let the opponent win by playing on top of ours.
  const safe = legal.filter((col) => {
    const { board: next } = drop(board, col, me, c)
    return !legalColumns(next, c).some((reply) => wins(next, reply, them, c))
  })
  const pool = safe.length ? safe : legal

  const ranked = preference(c.cols).filter((col) => pool.includes(col))
  // Mostly the best-ranked column, sometimes the runner-up, so games vary.
  const pick = Math.random() < 0.7 ? 0 : Math.min(1, ranked.length - 1)
  return ranked[pick] ?? pool[0]
}
