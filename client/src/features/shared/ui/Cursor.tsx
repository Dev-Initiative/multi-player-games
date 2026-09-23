import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { useEffect, useState } from 'react'

type Mode = 'default' | 'hover' | 'text' | 'hidden'
type Burst = { id: number; x: number; y: number }

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="switch"], [role="radio"], label, summary, select'
const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]'

// The class that hides the native cursor (see index.css). Added only once this
// component is running, so the normal cursor stays if JavaScript never loads.
const ROOT_CLASS = 'custom-cursor'

// The arrow is drawn in a 24×24 box with its tip at (3, 2). At SIZE px, these
// offsets put the tip exactly on the pointer's hotspot.
const SIZE = 30
const TIP_X = (3 / 24) * SIZE
const TIP_Y = (2 / 24) * SIZE

function modeFor(target: EventTarget | null): Mode {
  if (!(target instanceof Element)) return 'default'
  if (target.closest(TEXT_FIELD)) return 'text'
  const interactive = target.closest(INTERACTIVE)
  if (interactive && !interactive.matches(':disabled, [aria-disabled="true"]')) return 'hover'
  return 'default'
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width={SIZE} height={SIZE} className="overflow-visible">
      <defs>
        <linearGradient id="cursor-fill" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="var(--color-brand-400)" />
          <stop offset="1" stopColor="var(--color-brand-600)" />
        </linearGradient>
      </defs>
      {/* Drop shadow */}
      <path
        d="M3 2v17.2l4.6-4.3 3 6.6 3.1-1.4-3-6.5h6.4Z"
        transform="translate(1.2 1.6)"
        fill="rgb(0 0 0 / 0.45)"
        strokeLinejoin="round"
      />
      {/* Body */}
      <path
        d="M3 2v17.2l4.6-4.3 3 6.6 3.1-1.4-3-6.5h6.4Z"
        fill="url(#cursor-fill)"
        stroke="var(--color-night-950)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Gloss along the leading edge */}
      <path d="M4.6 5.2v9.6l2.4-2.3" fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Four corner brackets that lock on around whatever you're about to click. */
function Reticle({ active, pressed }: { active: boolean; pressed: boolean }) {
  const corner = 'absolute size-3 border-brand-400'
  return (
    <motion.div
      className="relative size-11"
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? (pressed ? 0.7 : 1) : 1.6,
        rotate: active ? 0 : -45,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <span className={`${corner} top-0 left-0 rounded-tl-md border-t-2 border-l-2`} />
      <span className={`${corner} top-0 right-0 rounded-tr-md border-t-2 border-r-2`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-md border-b-2 border-l-2`} />
      <span className={`${corner} right-0 bottom-0 rounded-br-md border-r-2 border-b-2`} />
    </motion.div>
  )
}

/**
 * Game cursor: a glossy arrow that leans into its motion, locks on to
 * clickable things, and bursts on click. Mount once at the root.
 * Mouse and trackpad only; touch devices keep the default.
 */
export function Cursor() {
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)
  const [mode, setMode] = useState<Mode>('hidden')
  const [pressed, setPressed] = useState(false)
  const [bursts, setBursts] = useState<Burst[]>([])
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)

  // Lean left/right with horizontal speed, springing back upright at rest.
  const velocityX = useVelocity(x)
  const lean = useTransform(velocityX, [-2400, 0, 2400], reduceMotion ? [0, 0, 0] : [-22, 0, 22], { clamp: true })
  const rotate = useSpring(lean, { stiffness: 260, damping: 22 })

  // The reticle trails a touch behind the arrow.
  const lag = reduceMotion ? { stiffness: 2000, damping: 100 } : { stiffness: 700, damping: 42 }
  const reticleX = useSpring(x, lag)
  const reticleY = useSpring(y, lag)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add(ROOT_CLASS)
    let nextId = 0

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      setMode(modeFor(e.target))
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      setPressed(true)
      const id = nextId++
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }])
    }
    const up = () => setPressed(false)
    const leave = () => setMode('hidden')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    root.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)

    return () => {
      root.classList.remove(ROOT_CLASS)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      root.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const visible = mode !== 'hidden' && mode !== 'text'
  const hover = mode === 'hover'

  return (
    <div aria-hidden className="cursor-layer pointer-events-none fixed inset-0 z-[9999]">
      {/* Click bursts */}
      <AnimatePresence>
        {bursts.map((b) => (
          <motion.span
            key={b.id}
            className="absolute size-12 rounded-full border-2 border-brand-400"
            style={{ left: b.x, top: b.y, translateX: '-50%', translateY: '-50%' }}
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => setBursts((all) => all.filter((o) => o.id !== b.id))}
          />
        ))}
      </AnimatePresence>

      {/* Lock-on reticle, centred on the tip */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x: reticleX, y: reticleY, translateX: '-50%', translateY: '-50%' }}
      >
        <Reticle active={visible && hover} pressed={pressed} />
      </motion.div>

      {/* Arrow, tip on the hotspot */}
      <motion.div
        className="absolute top-0 left-0"
        style={{ x, y, translateX: -TIP_X, translateY: -TIP_Y }}
      >
        <motion.div
          style={{ rotate, transformOrigin: `${TIP_X}px ${TIP_Y}px` }}
          animate={{
            opacity: visible ? 1 : 0,
            scale: !visible ? 0.5 : pressed ? 0.82 : hover ? 0.9 : 1,
          }}
          transition={{ type: 'spring', stiffness: 600, damping: 30 }}
        >
          <Arrow />
        </motion.div>
      </motion.div>
    </div>
  )
}
