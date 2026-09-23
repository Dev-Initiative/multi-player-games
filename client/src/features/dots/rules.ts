// Dots and Boxes rules as pure functions. Like Connect 4, the state is never
// stored: it is derived by replaying the move log, where each move is the
// index of the line (edge) a player drew.
//
// Players take turns drawing a line between two neighbouring dots. Drawing
// the fourth side of a box claims it and earns another turn. When every line
// is drawn, the most boxes wins.

/** Board size in boxes. 4×4 boxes is a 5×5 grid of dots. */
export const ROWS = 4
export const COLS = 4

/** Horizontal edges come first: (ROWS + 1) rows of COLS. Then vertical: ROWS rows of COLS + 1. */
export const H_EDGES = (ROWS + 1) * COLS
export const V_EDGES = ROWS * (COLS + 1)
export const EDGE_COUNT = H_EDGES + V_EDGES
export const BOX_COUNT = ROWS * COLS

export const hEdge = (row: number, col: number) => row * COLS + col
export const vEdge = (row: number, col: number) => H_EDGES + row * (COLS + 1) + col
export const isHorizontal = (edge: number) => edge < H_EDGES

/** Grid coordinates of an edge: the dot it starts at, and its direction. */
export function edgeCoords(edge: number) {
  if (isHorizontal(edge)) return { row: Math.floor(edge / COLS), col: edge % COLS, horizontal: true }
  const k = edge - H_EDGES
  return { row: Math.floor(k / (COLS + 1)), col: k % (COLS + 1), horizontal: false }
}

/** The four edges around box `box`. */
export function boxEdges(box: number) {
  const row = Math.floor(box / COLS)
  const col = box % COLS
  return [hEdge(row, col), hEdge(row + 1, col), vEdge(row, col), vEdge(row, col + 1)]
}

/** The one or two boxes an edge borders. */
export function boxesOf(edge: number): number[] {
  const { row, col, horizontal } = edgeCoords(edge)
  const boxes: number[] = []
  if (horizontal) {
    if (row > 0) boxes.push((row - 1) * COLS + col)
    if (row < ROWS) boxes.push(row * COLS + col)
  } else {
    if (col > 0) boxes.push(row * COLS + col - 1)
    if (col < COLS) boxes.push(row * COLS + col)
  }
  return boxes
}

/** Seat that drew each edge, or null if it is still open. */
export type Edges = (number | null)[]

export const sidesDrawn = (edges: Edges, box: number) => boxEdges(box).filter((e) => edges[e] !== null).length

export type Position = {
  edges: Edges
  /** Seat that claimed each box, or null. */
  boxes: (number | null)[]
  scores: number[]
  currentSeat: number | null
  winner: number | null
  draw: boolean
  lastEdge: number | null
  /** Boxes the last move claimed. */
  lastBoxes: number[]
  /** Boxes claimed by each move, in log order. */
  claims: number[]
}

/** Replay a move log. Drawing an edge twice, or one that doesn't exist, is illegal and throws. */
export function replay(moves: number[], firstSeat: number, seatCount: number): Position {
  const edges: Edges = Array(EDGE_COUNT).fill(null)
  const boxes: (number | null)[] = Array(BOX_COUNT).fill(null)
  const scores = Array(seatCount).fill(0)
  const claims: number[] = []
  let seat = firstSeat
  let lastEdge: number | null = null
  let lastBoxes: number[] = []

  for (const edge of moves) {
    if (!Number.isInteger(edge) || edge < 0 || edge >= EDGE_COUNT) throw new Error(`No such line: ${edge}`)
    if (edges[edge] !== null) throw new Error('That line is already drawn')
    edges[edge] = seat
    const claimed = boxesOf(edge).filter((b) => sidesDrawn(edges, b) === 4)
    for (const b of claimed) boxes[b] = seat
    scores[seat] += claimed.length
    claims.push(claimed.length)
    lastEdge = edge
    lastBoxes = claimed
    // Closing a box earns another turn.
    if (claimed.length === 0) seat = (seat + 1) % seatCount
  }

  const done = edges.every((e) => e !== null)
  const best = Math.max(...scores)
  const leaders = scores.flatMap((s, i) => (s === best ? [i] : []))
  return {
    edges,
    boxes,
    scores,
    currentSeat: done ? null : seat,
    winner: done && leaders.length === 1 ? leaders[0] : null,
    draw: done && leaders.length > 1,
    lastEdge,
    lastBoxes,
    claims,
  }
}

const LETTERS = 'ABCDEFGHIJ'

/** Human name for an edge by the dots it joins, e.g. "B2–C2". */
export function edgeName(edge: number) {
  const { row, col, horizontal } = edgeCoords(edge)
  const from = `${LETTERS[col]}${row + 1}`
  const to = horizontal ? `${LETTERS[col + 1]}${row + 1}` : `${LETTERS[col]}${row + 2}`
  return `${from}–${to}`
}
