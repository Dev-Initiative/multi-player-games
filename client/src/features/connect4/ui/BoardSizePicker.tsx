import { Minus, Plus, SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { LIMITS } from '../rules'

type Size = { cols: number; rows: number }

const PRESETS: (Size & { id: string; label: string; blurb: string })[] = [
  { id: 'mini', label: 'Mini', blurb: 'Quick and tight', cols: 5, rows: 4 },
  { id: 'classic', label: 'Classic', blurb: 'The original', cols: 7, rows: 6 },
  { id: 'wide', label: 'Wide', blurb: 'More room to plot', cols: 8, rows: 7 },
  { id: 'epic', label: 'Epic', blurb: 'The long game', cols: 9, rows: 7 },
]

type BoardSizePickerProps = {
  value: Size
  onChange: (size: Size) => void
}

/** A tiny board outline, drawn to the size it represents. */
function Grid({ cols, rows, active }: Size & { active: boolean }) {
  return (
    <div
      className={cn(
        'grid w-full gap-[2px] rounded-md p-1 transition-colors',
        active ? 'bg-linear-to-b from-brand-500 to-brand-700' : 'bg-night-700',
      )}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <span key={i} className="aspect-square rounded-full bg-night-950" />
      ))}
    </div>
  )
}

function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const btn =
    'grid size-9 place-items-center rounded-xl bg-night-700 text-night-100 transition-colors hover:bg-night-600 disabled:cursor-not-allowed disabled:opacity-35'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-night-300">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus className="size-4" strokeWidth={3} />
        </button>
        <motion.span
          key={value}
          initial={{ scale: 1.4, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-7 text-center font-display text-xl font-extrabold tabular-nums"
        >
          {value}
        </motion.span>
        <button type="button" className={btn} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`More ${label.toLowerCase()}`}>
          <Plus className="size-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  )
}

/** Preset board sizes, or any size within the limits. */
export function BoardSizePicker({ value, onChange }: BoardSizePickerProps) {
  const preset = PRESETS.find((p) => p.cols === value.cols && p.rows === value.rows)
  const [customMode, setCustomMode] = useState(!preset)
  const custom = customMode || !preset

  const card = (active: boolean) =>
    cn(
      'flex flex-col items-center gap-3 rounded-2xl p-3 text-center transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400',
      active ? 'bg-brand-500/10 ring-2 ring-brand-500' : 'bg-white/4 ring-1 ring-white/8 hover:bg-white/7',
    )

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Board size" className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {PRESETS.map((p) => {
          const active = !custom && preset?.id === p.id
          return (
            <motion.button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setCustomMode(false)
                onChange({ cols: p.cols, rows: p.rows })
              }}
              whileTap={{ scale: 0.96 }}
              className={card(active)}
            >
              <div className="flex h-14 w-full items-center justify-center">
                <div style={{ width: `${(p.cols / 9) * 100}%` }}>
                  <Grid cols={p.cols} rows={p.rows} active={active} />
                </div>
              </div>
              <div className="leading-tight">
                <div className="font-display font-extrabold">{p.label}</div>
                <div className="font-mono text-xs text-night-400">
                  {p.cols}×{p.rows}
                </div>
              </div>
            </motion.button>
          )
        })}
        <motion.button
          type="button"
          role="radio"
          aria-checked={custom}
          onClick={() => setCustomMode(true)}
          whileTap={{ scale: 0.96 }}
          className={cn(card(custom), 'col-span-2 sm:col-span-1')}
        >
          <div className="grid h-14 place-items-center">
            <SlidersHorizontal className={cn('size-7', custom ? 'text-brand-400' : 'text-night-400')} strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold">Custom</div>
            <div className="font-mono text-xs text-night-400">{custom ? `${value.cols}×${value.rows}` : 'any size'}</div>
          </div>
        </motion.button>
      </div>

      {custom && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-3 overflow-hidden rounded-2xl bg-night-950/60 p-4 ring-1 ring-white/6"
        >
          <Stepper
            label="Columns"
            value={value.cols}
            min={LIMITS.minCols}
            max={LIMITS.maxCols}
            onChange={(cols) => onChange({ ...value, cols })}
          />
          <Stepper
            label="Rows"
            value={value.rows}
            min={LIMITS.minRows}
            max={LIMITS.maxRows}
            onChange={(rows) => onChange({ ...value, rows })}
          />
        </motion.div>
      )}
    </div>
  )
}
