import { Send, Shuffle, UserRound, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../../auth/context'
import { findPlayer, type PlayerProfile } from '../../games/players'
import { createConnect4Invite, gamePath, useGames } from '../../games/store'
import { ColorPicker } from '../../games/ui/ColorPicker'
import { InvitePicker } from '../../games/ui/InvitePicker'
import { Avatar } from '../../shared/ui/Avatar'
import { Button } from '../../shared/ui/Button'
import { Disc } from '../../shared/ui/Disc'
import { Panel } from '../../shared/ui/Panel'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import type { Seat } from '../../shared/ui/seat'
import { CLASSIC, emptyPosition, isValidConfig, LIMITS, type Connect4Config } from '../rules'
import { BoardSizePicker } from './BoardSizePicker'
import { Connect4Board } from './Connect4Board'
import { ConfigChips } from './ConfigChips'

type FirstMove = 'you' | 'them' | 'random'

// Their disc: the first of these that isn't yours, so the two always contrast.
const CONTRAST: Seat[] = ['sun', 'sky', 'lime', 'tangerine']

function Step({ n, title, detail, children }: { n: number; title: string; detail?: string; children: ReactNode }) {
  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-500 font-display text-sm font-extrabold text-white shadow-[0_3px_0_var(--color-brand-800)]">
          {n}
        </span>
        <div>
          <h2 className="text-xl font-extrabold">{title}</h2>
          {detail && <p className="text-sm text-night-400">{detail}</p>}
        </div>
      </div>
      {children}
    </Panel>
  )
}

/** Everything needed to open a Connect 4 lobby: who, what board, what rules. */
export function Connect4Setup() {
  const navigate = useNavigate()
  const { player } = useAuth()
  const games = useGames()

  const [invitee, setInvitee] = useState<PlayerProfile | null>(null)
  const [config, setConfig] = useState<Connect4Config>(CLASSIC)
  const [first, setFirst] = useState<FirstMove>('you')
  const [color, setColor] = useState<Seat>('sky')

  const theirColor = CONTRAST.find((c) => c !== color)!
  const maxConnect = Math.min(LIMITS.maxConnect, config.cols, config.rows)

  // People you've played before, most recent first, if they're in the directory.
  const recent = [
    ...new Map(
      games
        .flatMap((g) => g.seats.filter((s) => !s.isYou))
        .map((s) => (s.username ? findPlayer(s.username) : undefined) ?? findPlayer(s.name.toLowerCase().replace(/\s+/g, '_')))
        .filter((p): p is PlayerProfile => !!p)
        .map((p) => [p.username, p]),
    ).values(),
  ].slice(0, 5)

  function setSize(size: { cols: number; rows: number }) {
    // Keep the line length playable on the new board.
    setConfig((c) => ({ ...size, connect: Math.min(c.connect, size.cols, size.rows, LIMITS.maxConnect) }))
  }

  function send() {
    if (!invitee || !isValidConfig(config)) return
    const firstSeat = first === 'you' ? 0 : first === 'them' ? 1 : Math.random() < 0.5 ? 0 : 1
    const id = createConnect4Invite({
      you: { name: player?.username ?? 'You', username: player?.username, color },
      opponent: { name: invitee.name, username: invitee.username, color: theirColor },
      config,
      firstSeat,
    })
    navigate(gamePath({ type: 'connect-4', id }))
  }

  const firstLabel =
    first === 'random' ? 'Coin flip for first move' : first === 'you' ? 'You move first' : `${invitee?.name.split(' ')[0] ?? 'They'} move first`

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-5">
        <Step n={1} title="Invite a player" detail="Search by username. The game starts when they accept.">
          <InvitePicker value={invitee} onChange={setInvitee} recent={recent} exclude={player ? [player.username] : []} />
        </Step>

        <Step n={2} title="Pick a board" detail="Bigger boards make for longer, trickier games.">
          <BoardSizePicker value={config} onChange={setSize} />
          <div className="mt-5">
            <div className="mb-2 text-sm font-bold text-night-200">Discs in a row to win</div>
            <SegmentedControl
              label="Discs in a row to win"
              fill
              value={String(config.connect)}
              onChange={(v) => setConfig((c) => ({ ...c, connect: Number(v) }))}
              options={[3, 4, 5].map((n) => ({
                value: String(n),
                label: `Connect ${n}`,
                disabled: n > maxConnect,
              }))}
            />
          </div>
        </Step>

        <Step n={3} title="House rules">
          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-bold text-night-200">Who goes first</div>
              <SegmentedControl<FirstMove>
                label="Who goes first"
                fill
                value={first}
                onChange={setFirst}
                options={[
                  { value: 'you', label: 'Me', icon: UserRound },
                  { value: 'them', label: 'Them', icon: Users },
                  { value: 'random', label: 'Coin flip', icon: Shuffle },
                ]}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-bold text-night-200">Your disc</div>
              <ColorPicker label="Your disc color" value={color} onChange={setColor} />
            </div>
          </div>
        </Step>
      </div>

      {/* Live preview and send */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Panel className="space-y-5 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Disc seat={color} className="size-8" />
              <span className="font-bold">You</span>
            </div>
            <span className="font-display text-sm font-extrabold tracking-widest text-night-500">VS</span>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="truncate font-bold">{invitee ? invitee.name.split(' ')[0] : '???'}</span>
              {invitee ? (
                <Avatar name={invitee.name} seat={theirColor} size="sm" />
              ) : (
                <Disc seat={theirColor} className="size-8 opacity-40" />
              )}
            </div>
          </div>

          <motion.div
            key={`${config.cols}x${config.rows}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-none -mt-2"
            aria-hidden
          >
            <Connect4Board position={emptyPosition(config)} colors={[color, theirColor]} playerSeat={null} onDrop={() => {}} />
          </motion.div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            <ConfigChips config={config} />
            <span className="inline-flex items-center rounded-full bg-white/6 px-2.5 py-1 text-xs font-bold text-night-200 ring-1 ring-white/8">
              {firstLabel}
            </span>
          </div>

          <Button size="lg" icon={Send} className="w-full" disabled={!invitee} onClick={send}>
            {invitee ? `Invite ${invitee.name.split(' ')[0]}` : 'Pick someone to invite'}
          </Button>
          <p className="text-center text-xs text-night-500">
            The board and rules are locked once the invite is sent.
          </p>
        </Panel>
      </aside>
    </div>
  )
}
