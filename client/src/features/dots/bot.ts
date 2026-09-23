import { boxesOf, EDGE_COUNT, sidesDrawn, type Edges } from './rules'

const openEdges = (edges: Edges) => Array.from({ length: EDGE_COUNT }, (_, e) => e).filter((e) => edges[e] === null)

const completesBox = (edges: Edges, edge: number) => boxesOf(edge).some((b) => sidesDrawn(edges, b) === 3)

/** How many boxes the opponent could chain-capture if we drew `edge`. */
function giveaway(edges: Edges, edge: number) {
  const next = edges.slice()
  next[edge] = 0
  let taken = 0
  for (;;) {
    const grab = openEdges(next).find((e) => completesBox(next, e))
    if (grab === undefined) return taken
    next[grab] = 1
    taken += boxesOf(grab).filter((b) => sidesDrawn(next, b) === 4).length
  }
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]

/**
 * A stand-in opponent. Greedy but not careless: take any box on offer, else
 * draw a line that doesn't hand over a box, else give away as few as possible.
 */
export function chooseEdge(edges: Edges): number {
  const open = openEdges(edges)

  const scoring = open.filter((e) => completesBox(edges, e))
  if (scoring.length) return pick(scoring)

  // Safe lines leave every neighbouring box with at most two sides.
  const safe = open.filter((e) => boxesOf(e).every((b) => sidesDrawn(edges, b) < 2))
  if (safe.length) return pick(safe)

  let best = open[0]
  let fewest = Infinity
  for (const e of open) {
    const cost = giveaway(edges, e)
    if (cost < fewest) {
      fewest = cost
      best = e
    }
  }
  return best
}
