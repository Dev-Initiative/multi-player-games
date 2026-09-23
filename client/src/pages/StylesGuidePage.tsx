import {
  ArrowLeft,
  Bell,
  Circle,
  Coins,
  Crown,
  Dices,
  Flag,
  Flame,
  Gamepad2,
  Grip,
  Hash,
  Heart,
  Send,
  Settings,
  Ship,
  Sparkles,
  Star,
  Swords,
  Target,
  Timer,
  Trophy,
  UserPlus,
  Users,
  Volume2,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Avatar } from '../features/shared/ui/Avatar'
import { Badge } from '../features/shared/ui/Badge'
import { Button } from '../features/shared/ui/Button'
import { Currency } from '../features/shared/ui/Currency'
import { Disc } from '../features/shared/ui/Disc'
import { GameTile } from '../features/shared/ui/GameTile'
import { Meter } from '../features/shared/ui/Meter'
import { Panel } from '../features/shared/ui/Panel'
import { PlayerRow } from '../features/shared/ui/PlayerRow'
import { SEATS } from '../features/shared/ui/seat'
import { Toast } from '../features/shared/ui/Toast'
import { Toggle } from '../features/shared/ui/Toggle'
import { Connect4Demo } from '../features/styles-guide/ui/Connect4Demo'
import { Label, Section } from '../features/styles-guide/ui/Section'
import { SeatSwatch, Swatch } from '../features/styles-guide/ui/Swatch'
import { TicTacToeDemo } from '../features/styles-guide/ui/TicTacToeDemo'

// Token names mirror the @theme block in index.css. Values are read from the
// live CSS variables so this page never drifts from the theme.
const scale = (name: string, shades: number[]) => shades.map((s) => `${name}-${s}`)

const SCALES = [
  {
    title: 'Night',
    note: 'The stage. Surfaces get lighter as they rise; the lightest shades are text.',
    tokens: scale('night', [950, 900, 800, 700, 600, 500, 400, 300, 200, 100, 50]),
  },
  {
    title: 'Brand',
    note: 'Scarlet. Primary actions, focus rings, links, the board, and errors.',
    tokens: scale('brand', [900, 800, 700, 600, 500, 400, 300, 200, 100]),
  },
]

const NAV = ['Colors', 'Type', 'Buttons', 'Players', 'Pieces', 'Feedback', 'Games', 'Play', 'Icons']

const TYPE_SCALE = [
  { className: 'font-display text-7xl font-extrabold', label: 'display 800 · 7xl', sample: 'Victory!' },
  { className: 'font-display text-5xl font-extrabold', label: 'display 800 · 5xl', sample: 'Your move' },
  { className: 'font-display text-3xl font-bold', label: 'display 700 · 3xl', sample: 'Connect 4' },
  { className: 'font-display text-xl font-bold', label: 'display 700 · xl', sample: 'Round 3 of 5' },
  { className: 'text-lg', label: 'sans 400 · lg', sample: 'Grace invited you to a game of Battleship.' },
  { className: 'text-base text-night-200', label: 'sans 400 · base', sample: 'Games stay open until someone moves, even for days.' },
  { className: 'text-sm text-night-300', label: 'sans 400 · sm', sample: 'Last move 2 hours ago' },
  { className: 'font-mono text-sm text-night-300', label: 'mono 400 · sm', sample: 'game/7f3a · seq 14 · v3' },
]

const ICONS: [string, LucideIcon][] = [
  ['Gamepad2', Gamepad2], ['Swords', Swords], ['Trophy', Trophy], ['Crown', Crown],
  ['Coins', Coins], ['Flame', Flame], ['Zap', Zap], ['Star', Star],
  ['Heart', Heart], ['Target', Target], ['Ship', Ship], ['Grip', Grip],
  ['Hash', Hash], ['Dices', Dices], ['Timer', Timer], ['Flag', Flag],
  ['Users', Users], ['UserPlus', UserPlus], ['Send', Send], ['Bell', Bell],
  ['Volume2', Volume2], ['Settings', Settings], ['Sparkles', Sparkles], ['Circle', Circle],
]


export function StylesGuidePage() {
  const [sound, setSound] = useState(true)
  const [haptics, setHaptics] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/6 bg-night-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid size-9 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_3px_0_var(--color-brand-700)]">
              <Gamepad2 className="size-5" strokeWidth={2.5} />
            </span>
            <span className="hidden sm:inline">Styles guide</span>
          </Link>
          <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto px-1 text-sm font-semibold [scrollbar-width:none]">
            {NAV.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-night-300 transition-colors hover:bg-white/6 hover:text-white"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Currency icon={Coins} value={1280} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-12 sm:px-8">
        <div className="relative space-y-5">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-night-300 hover:text-white">
            <ArrowLeft className="size-4" /> Home
          </Link>
          <div className="flex items-center gap-3">
            {SEATS.map((seat, i) => (
              <Disc key={seat} seat={seat} className="size-10 animate-float" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <h1 className="text-6xl font-extrabold sm:text-7xl">
            Game{' '}
            <span className="bg-linear-to-r from-brand-500 via-brand-400 to-tangerine bg-clip-text text-transparent">kit</span>
          </h1>
          <p className="max-w-2xl text-lg text-night-200">
            Tokens live in <code className="font-mono text-base text-brand-300">src/index.css</code>, components in{' '}
            <code className="font-mono text-base text-brand-300">src/features/shared/ui</code>. Everything on this page is
            built from them.
          </p>
        </div>

        <Section title="Colors" kicker="Tokens">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[...SEATS, 'gold' as const].map((seat) => (
              <SeatSwatch key={seat} seat={seat} />
            ))}
          </div>
          {SCALES.map((group) => (
            <Panel key={group.title}>
              <h3 className="text-xl font-bold">{group.title}</h3>
              <p className="mb-4 text-sm text-night-300">{group.note}</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-11">
                {group.tokens.map((token) => (
                  <Swatch key={token} token={token} />
                ))}
              </div>
            </Panel>
          ))}
        </Section>

        <Section title="Type" kicker="Bricolage Grotesque · Manrope · JetBrains Mono">
          <Panel className="divide-y divide-white/6 p-0 sm:p-0">
            {TYPE_SCALE.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-8 sm:px-6">
                <div className="w-40 shrink-0 font-mono text-xs text-night-400">{row.label}</div>
                <div className={`${row.className} min-w-0 truncate`}>{row.sample}</div>
              </div>
            ))}
          </Panel>
        </Section>

        <Section title="Buttons" kicker="Press them">
          <Panel className="space-y-8">
            <div>
              <Label>Variants</Label>
              <div className="flex flex-wrap items-center gap-4">
                <Button icon={Swords}>Start game</Button>
                <Button variant="secondary" icon={UserPlus}>Invite</Button>
                <Button variant="lime" icon={Send}>Submit move</Button>
                <Button variant="sun" icon={Star}>Rematch</Button>
                <Button variant="sky" icon={Users}>Join lobby</Button>
                <Button variant="tangerine" icon={Flag}>Resign</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </div>
            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap items-end gap-4">
                <Button size="lg" icon={Gamepad2}>Play now</Button>
                <Button size="md">Play now</Button>
                <Button size="sm">Play now</Button>
              </div>
            </div>
            <div>
              <Label>Icon only &amp; disabled</Label>
              <div className="flex flex-wrap items-center gap-4">
                <Button square variant="secondary" icon={Settings} aria-label="Settings" />
                <Button square variant="secondary" icon={Volume2} aria-label="Sound" />
                <Button square variant="sun" icon={Trophy} aria-label="Leaderboard" />
                <Button square size="lg" icon={Zap} aria-label="Quick match" />
                <Button disabled icon={Timer}>Not your turn</Button>
              </div>
            </div>
          </Panel>
        </Section>

        <Section title="Players" kicker="Seats, avatars, scoreboard">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="space-y-6">
              <div>
                <Label>Avatars</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name="Ada Lovelace" seat="tangerine" size="lg" active />
                  <Avatar name="Grace Hopper" seat="sun" size="lg" />
                  <Avatar name="Linus" seat="sky" size="md" />
                  <Avatar name="Barbara" seat="lime" size="md" />
                  <Avatar name="Alan" seat="tangerine" size="sm" />
                </div>
              </div>
              <div>
                <Label>Badges</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="brand" live>Your turn</Badge>
                  <Badge>Waiting</Badge>
                  <Badge tone="lime" icon={Crown}>Won</Badge>
                  <Badge tone="tangerine">Lost</Badge>
                  <Badge tone="sun" icon={Timer}>In lobby</Badge>
                  <Badge tone="sky">2 / 4 seats</Badge>
                  <Badge tone="gold" icon={Flame}>5 streak</Badge>
                </div>
              </div>
              <div>
                <Label>Currency</Label>
                <div className="flex flex-wrap gap-3">
                  <Currency icon={Coins} value={1280} />
                  <Currency icon={Trophy} value={42} />
                  <Currency icon={Flame} value={5} />
                </div>
              </div>
            </Panel>
            <Panel className="space-y-2.5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Dots and Boxes</h3>
                <Badge tone="brand" live>Live</Badge>
              </div>
              <PlayerRow name="Ada Lovelace" seat="tangerine" score={7} active />
              <PlayerRow name="Grace Hopper" seat="sun" score={5} status="Moved 2h ago" />
              <PlayerRow name="Linus" seat="sky" score={4} />
              <PlayerRow name="Barbara" seat="lime" score={2} status="Offline" />
            </Panel>
          </div>
        </Section>

        <Section title="Pieces" kicker="What goes on the board">
          <div className="grid gap-4 md:grid-cols-2">
            <Panel>
              <Label>Discs</Label>
              <div className="flex flex-wrap items-end gap-4">
                {SEATS.map((seat) => (
                  <Disc key={seat} seat={seat} className="size-16" />
                ))}
                {SEATS.map((seat) => (
                  <Disc key={seat} seat={seat} className="size-8" />
                ))}
              </div>
            </Panel>
            <Panel className="flex flex-col items-center">
              <Label>Marks · winning line</Label>
              <TicTacToeDemo />
            </Panel>
          </div>
        </Section>

        <Section title="Feedback" kicker="Toasts, timers, settings">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Toast tone="success" title="Move accepted">Sequence #14 · Grace is up next</Toast>
              <Toast tone="warning" title="Reconnecting…">Your move is queued and will send when you're back.</Toast>
              <Toast tone="danger" title="That column is full">Pick another column.</Toast>
              <Toast tone="info" title="Linus joined" action={<Button size="sm" variant="secondary">View</Button>} />
            </div>
            <Panel className="space-y-6">
              <Meter label="Turn timer" detail="18h left" value={0.75} seat="lime" />
              <Meter label="Opponent's clock" detail="3h left" value={0.12} seat="tangerine" />
              <Meter label="Level 12" detail="840 / 1,000 XP" value={0.84} seat="sun" />
              <div className="flex flex-wrap gap-6 border-t border-white/6 pt-6">
                <Toggle label="Sound" checked={sound} onChange={setSound} />
                <Toggle label="Haptics" checked={haptics} onChange={setHaptics} />
              </div>
            </Panel>
          </div>
        </Section>

        <Section title="Games" kicker="Lobby tiles">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <GameTile title="Connect 4" players="2 players" icon={Circle} seat="tangerine" />
            <GameTile title="Dots and Boxes" players="2–4 players" icon={Grip} seat="lime" />
            <GameTile title="Battleship" players="2 players" icon={Ship} seat="sky" />
            <GameTile title="Tic-tac-toe" players="2 players" icon={Hash} seat="sun" />
          </div>
        </Section>

        <Section title="Play" kicker="Everything together">
          <Panel className="py-8">
            <Connect4Demo />
          </Panel>
        </Section>

        <Section title="Icons" kicker="lucide-react · size-* and text-*">
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {ICONS.map(([name, Icon]) => (
              <div
                key={name}
                className="panel flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform hover:-translate-y-1"
              >
                <Icon className="size-6 text-night-100" strokeWidth={2.25} />
                <span className="text-[11px] text-night-400">{name}</span>
              </div>
            ))}
          </div>
        </Section>
      </main>
    </div>
  )
}

