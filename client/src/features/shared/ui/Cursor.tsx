import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../../../lib/cn'

type Mode = 'default' | 'hover' | 'text' | 'hidden'

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="switch"], [role="radio"], label, summary, select'
const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]'

// The class that hides the native cursor (see index.css). Added only once this
// component is running, so the normal cursor stays if JavaScript never loads.
const ROOT_CLASS = 'custom-cursor'

function modeFor(target: EventTarget | null): Mode {
  if (!(target instanceof Element)) return 'default'
  if (target.closest(TEXT_FIELD)) return 'text'
  const interactive = target.closest(INTERACTIVE)
  if (interactive && !interactive.matches(':disabled, [aria-disabled="true"]')) return 'hover'
  return 'default'
}

/**
 * Game cursor: a red dot that tracks the pointer exactly and a ring that
 * trails it on a spring. Mount once at the root. Mouse and trackpad only.
 */
export function Cursor() {
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)
  const [mode, setMode] = useState<Mode>('hidden')
  const [pressed, setPressed] = useState(false)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const spring = reduceMotion ? { stiffness: 2000, damping: 100 } : { stiffness: 520, damping: 38, mass: 0.6 }
  const ringX = useSpring(x, spring)
  const ringY = useSpring(y, spring)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add(ROOT_CLASS)

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setMode(modeFor(e.target))
    }
    const down = () => setPressed(true)
    const up = () => setPressed(false)
    const leave = () => setMode('hidden')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)

    return () => {
      root.classList.remove(ROOT_CLASS)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const visible = mode !== 'hidden' && mode !== 'text'
  const hover = mode === 'hover'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Trailing ring */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          className={cn(
            'rounded-full border-2 transition-colors duration-200',
            hover ? 'border-brand-400 bg-brand-500/15' : 'border-white/50 bg-transparent',
          )}
          animate={{
            width: hover ? 52 : 34,
            height: hover ? 52 : 34,
            opacity: visible ? 1 : 0,
            scale: pressed ? 0.75 : 1,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        />
      </motion.div>

      {/* Dot */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      >
        <motion.div
          className="size-2.5 rounded-full bg-brand-500 shadow-[0_0_12px_2px_rgb(232_33_46/0.6)]"
          animate={{ scale: !visible ? 0 : hover ? 0.4 : pressed ? 1.6 : 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        />
      </motion.div>
    </div>
  )
}
