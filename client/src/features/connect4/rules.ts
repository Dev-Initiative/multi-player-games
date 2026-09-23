// Connect 4 rules as pure functions, shaped like the server's GameRules:
// the state is never stored, only derived by replaying the move log.
// The board size and line length come from the game's immutable config.

export type Connect4Config = {
  cols: number
  rows: number
  /** Discs in a row needed to win. */
  connect: number
}

export const CLASSIC: Connect4Config = { cols: 7, rows: 6, connect: 4 }

export const LIMITS = { minCols: 4, maxCols: 9, minRows: 4, maxRows: 8, minConnect: 3, maxConnect: 5 }

/** A config is playable when a winning line fits both across and down. */
export const isValidConfig = (c: Connect4Config) =>
  c.cols >= LIMITS.minCols &&
  c.cols <= LIMITS.maxCols &&
  c.rows >= LIMITS.minRows &&
  c.rows <= LIMITS.maxRows &&
  c.connect >= LIMITS.minConnect &&
  c.connect <= Math.min(LIMITS.maxConnect, c.cols, c.rows)

/** A cell holds the seat index of the disc in it, or null. Row 0 is the top. */
export type Cell = number | null
export type Board = Cell[]

export type Position = {
  config: Connect4Config
  board: Board
  /** Whose turn it is, or null once the game is over. */
  currentSeat: number | null
  winner: number | null
  /** Board indices of every disc in a winning line. */
  winLine: number[]
  draw: boolean
  lastMove: { row: number; col: number; index: number } | null
}

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const

export const indexOf = (row: number, col: number, c: Connect4Config) => row * c.cols + col

export function emptyBoard(c: Connect4Config): Board {
  return Array<Cell>(c.rows * c.cols).fill(null)
}

/** The row a disc dropped in `col` would land in, or null if the column is full. */
export function landingRow(board: Board, col: number, c: Connect4Config): number | null {
  for (let row = c.rows - 1; row >= 0; row--) {
    if (board[indexOf(row, col, c)] === null) return row
  }
  return null
}

export function legalColumns(board: Board, c: Connect4Config): number[] {
  return Array.from({ length: c.cols }, (_, col) => col).filter((col) => landingRow(board, col, c) !== null)
}

/** Every disc in a winning line through (row, col), or [] if there is none. */
export function winningLine(board: Board, row: number, col: number, c: Connect4Config): number[] {
  const seat = board[indexOf(row, col, c)]
  if (seat === null) return []
  const line = new Set<number>()
  for (const [dr, dc] of DIRECTIONS) {
    const run = [indexOf(row, col, c)]
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let k = col + dc * sign
      while (r >= 0 && r < c.rows && k >= 0 && k < c.cols && board[indexOf(r, k, c)] === seat) {
        run.push(indexOf(r, k, c))
        r += dr * sign
        k += dc * sign
      }
    }
    if (run.length >= c.connect) run.forEach((i) => line.add(i))
  }
  return [...line]
}

/** Drop a disc for `seat`. Returns the new board and where it landed; never mutates. */
export function drop(board: Board, col: number, seat: number, c: Connect4Config) {
  if (!Number.isInteger(col) || col < 0 || col >= c.cols) throw new Error(`No column ${col + 1}`)
  const row = landingRow(board, col, c)
  if (row === null) throw new Error(`Column ${col + 1} is full`)
  const next = board.slice()
  next[indexOf(row, col, c)] = seat
  return { board: next, row }
}

/** The starting position for a config, before any moves. */
export const emptyPosition = (c: Connect4Config, firstSeat = 0): Position => replay([], firstSeat, c)

/**
 * Replay a move log from the empty board. Moves after the game ended, or into
 * a full column, are illegal and throw: a valid log never contains them.
 */
export function replay(columns: number[], firstSeat: number, c: Connect4Config = CLASSIC): Position {
  let board = emptyBoard(c)
  let seat = firstSeat
  let lastMove: Position['lastMove'] = null
  let winLine: number[] = []

  for (const col of columns) {
    if (winLine.length) throw new Error('Move after the game ended')
    const result = drop(board, col, seat, c)
    board = result.board
    lastMove = { row: result.row, col, index: indexOf(result.row, col, c) }
    winLine = winningLine(board, result.row, col, c)
    seat = 1 - seat
  }

  const winner = lastMove && winLine.length ? board[lastMove.index] : null
  const draw = winner === null && legalColumns(board, c).length === 0
  return {
    config: c,
    board,
    currentSeat: winner !== null || draw ? null : seat,
    winner,
    winLine,
    draw,
    lastMove,
  }
}
