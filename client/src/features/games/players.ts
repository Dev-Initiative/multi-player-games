import { colorFor, type Seat } from '../shared/ui/seat'

export type PlayerProfile = {
  username: string
  name: string
  color: Seat
  /** Shown in search results; stand-in data. */
  wins: number
}

// Stand-in for the server's player lookup (`players` table, unique by
// lower(username)). Invites will search the API instead.
const PEOPLE: [username: string, name: string, wins: number][] = [
  ['grace_hopper', 'Grace Hopper', 251],
  ['linus_t', 'Linus T', 198],
  ['ada_lovelace', 'Ada Lovelace', 287],
  ['barbara_l', 'Barbara L', 312],
  ['alan_turing', 'Alan Turing', 176],
  ['joan_clarke', 'Joan Clarke', 143],
  ['katherine_j', 'Katherine Johnson', 221],
  ['dennis_r', 'Dennis R', 88],
  ['margaret_h', 'Margaret Hamilton', 264],
  ['ken_t', 'Ken T', 59],
  ['radia_p', 'Radia Perlman', 130],
  ['edsger', 'Edsger D', 97],
]

export const DIRECTORY: PlayerProfile[] = PEOPLE.map(([username, name, wins]) => ({
  username,
  name,
  wins,
  color: colorFor(username),
}))

/** Usernames are unique case-insensitively, like the server's index on lower(username). */
export const findPlayer = (username: string) =>
  DIRECTORY.find((p) => p.username.toLowerCase() === username.trim().replace(/^@/, '').toLowerCase())

/** Players whose username or name contains the query, best matches first. */
export function searchPlayers(query: string, exclude: string[] = []) {
  const q = query.trim().replace(/^@/, '').toLowerCase()
  const skip = new Set(exclude.map((u) => u.toLowerCase()))
  return DIRECTORY.filter((p) => !skip.has(p.username.toLowerCase()))
    .filter((p) => !q || p.username.includes(q) || p.name.toLowerCase().includes(q))
    .sort((a, b) => Number(!a.username.startsWith(q)) - Number(!b.username.startsWith(q)))
}
