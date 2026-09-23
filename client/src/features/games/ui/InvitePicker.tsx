import { AtSign, CircleAlert, Clock, Trophy, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState, type KeyboardEvent } from 'react'
import { USERNAME_PATTERN } from '../../../auth/validation'
import { cn } from '../../../lib/cn'
import { Avatar } from '../../shared/ui/Avatar'
import { findPlayer, searchPlayers, type PlayerProfile } from '../players'

type InvitePickerProps = {
  value: PlayerProfile | null
  onChange: (player: PlayerProfile | null) => void
  /** People you've played before, offered as one-tap picks. */
  recent: PlayerProfile[]
  /** Usernames that can't be invited (you). */
  exclude?: string[]
}

/** Find a player by username and pick them to invite. */
export function InvitePicker({ value, onChange, recent, exclude = [] }: InvitePickerProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [error, setError] = useState<string>()
  const listId = useId()

  const results = searchPlayers(query, exclude).slice(0, 6)

  function choose(player: PlayerProfile) {
    onChange(player)
    setQuery('')
    setOpen(false)
    setError(undefined)
  }

  function submitTyped() {
    const typed = query.trim().replace(/^@/, '')
    if (!typed) return
    if (!USERNAME_PATTERN.test(typed)) return setError('Usernames are 3–20 letters, numbers or _')
    const found = findPlayer(typed)
    if (!found || exclude.includes(found.username)) return setError(`No player called @${typed}`)
    choose(found)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && results[active]) choose(results[active])
      else submitTyped()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  if (value) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 rounded-2xl bg-lime/8 p-3 pr-4 ring-2 ring-lime/50"
      >
        <Avatar name={value.name} seat={value.color} size="lg" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-lg font-extrabold">{value.name}</div>
          <div className="font-mono text-sm text-night-400">@{value.username}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-night-400">
            <Trophy className="size-3.5 text-gold" strokeWidth={2.5} /> {value.wins} wins
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-night-300 hover:bg-white/8 hover:text-white"
        >
          <X className="size-4" strokeWidth={2.5} /> Change
        </button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          className={cn(
            'flex h-13 items-center gap-3 rounded-2xl bg-night-950/70 px-4 shadow-[inset_0_2px_4px_rgb(0_0_0/0.45)] ring-2 transition-shadow',
            error ? 'ring-brand-500/80' : 'ring-white/8 focus-within:ring-brand-400',
          )}
        >
          <AtSign className={cn('size-5 shrink-0', error ? 'text-brand-400' : 'text-night-400')} strokeWidth={2.5} />
          <input
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Username to invite"
            aria-invalid={error ? true : undefined}
            value={query}
            placeholder="Search by username or name"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              setOpen(true)
              setError(undefined)
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKeyDown}
            className="h-full min-w-0 flex-1 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-night-500"
          />
        </div>

        <AnimatePresence>
          {open && results.length > 0 && (
            <motion.ul
              id={listId}
              role="listbox"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="panel absolute inset-x-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl p-1.5"
            >
              {results.map((p, i) => (
                <li
                  key={p.username}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(p)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2',
                    i === active ? 'bg-white/8' : 'hover:bg-white/5',
                  )}
                >
                  <Avatar name={p.name} seat={p.color} size="sm" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate font-bold">{p.name}</div>
                    <div className="font-mono text-xs text-night-400">@{p.username}</div>
                  </div>
                  <span className="text-xs font-semibold text-night-500">{p.wins} wins</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="flex animate-pop items-center gap-1.5 text-sm font-semibold text-brand-400">
          <CircleAlert className="size-4" strokeWidth={2.5} /> {error}
        </p>
      )}

      {recent.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-widest text-night-500 uppercase">
            <Clock className="size-3.5" strokeWidth={2.5} /> Played recently
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((p) => (
              <button
                key={p.username}
                type="button"
                onClick={() => choose(p)}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 py-1 pr-3.5 pl-1 text-sm font-semibold ring-1 ring-white/8 transition-colors hover:bg-white/10"
              >
                <Avatar name={p.name} seat={p.color} size="sm" />
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
