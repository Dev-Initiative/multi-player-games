// Connect 4 rules as pure functions, shaped like the server's GameRules:
// the state is never stored, only derived by replaying the move log.

export const COLS = 7
export const ROWS = 6

/** A cell holds the seat index (0 or 1) of the disc in it, or null. Row 0 is the top. */
export type Cell = number | null
export type Board = Cell[]

export type Position = {
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

export const indexOf = (row: number, col: number) => row * COLS + col

export function emptyBoard(): Board {
  return Array<Cell>(ROWS * COLS).fill(null)
}

/** The row a disc dropped in `col` would land in, or null if the column is full. */
export function landingRow(board: Board, col: number): number | null {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[indexOf(row, col)] === null) return row
  }
  return null
}

export function legalColumns(board: Board): number[] {
  return Array.from({ length: COLS }, (_, c) => c).filter((c) => landingRow(board, c) !== null)
}

/** Every disc in a line of four or more through (row, col), or [] if there is none. */
export function winningLine(board: Board, row: number, col: number): number[] {
  const seat = board[indexOf(row, col)]
  if (seat === null) return []
  const line = new Set<number>()
  for (const [dr, dc] of DIRECTIONS) {
    const run = [indexOf(row, col)]
    for (const sign of [1, -1]) {
      let r = row + dr * sign
      let c = col + dc * sign
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[indexOf(r, c)] === seat) {
        run.push(indexOf(r, c))
        r += dr * sign
        c += dc * sign
      }
    }
    if (run.length >= 4) run.forEach((i) => line.add(i))
  }
  return [...line]
}

/** Drop a disc for `seat`. Returns the new board and where it landed; never mutates. */
export function drop(board: Board, col: number, seat: number) {
  const row = landingRow(board, col)
  if (row === null) throw new Error(`Column ${col + 1} is full`)
  const next = board.slice()
  next[indexOf(row, col)] = seat
  return { board: next, row }
}

/**
 * Replay a move log from the empty board. Moves after the game ended, or into
 * a full column, are illegal and throw: a valid log never contains them.
 */
export function replay(columns: number[], firstSeat: number): Position {
  let board = emptyBoard()
  let seat = firstSeat
  let lastMove: Position['lastMove'] = null
  let winLine: number[] = []

  for (const col of columns) {
    if (winLine.length) throw new Error('Move after the game ended')
    const result = drop(board, col, seat)
    board = result.board
    lastMove = { row: result.row, col, index: indexOf(result.row, col) }
    winLine = winningLine(board, result.row, col)
    seat = 1 - seat
  }

  const winner = lastMove && winLine.length ? board[lastMove.index] : null
  const draw = winner === null && legalColumns(board).length === 0
  return {
    board,
    currentSeat: winner !== null || draw ? null : seat,
    winner,
    winLine,
    draw,
    lastMove,
  }
}
