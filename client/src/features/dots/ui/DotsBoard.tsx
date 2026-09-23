type DotsBoardProps = {
  /** Size in boxes; 4×4 boxes is a 5×5 grid of dots. */
  cols?: number
  rows?: number
}

// SVG units: one box is S wide, with a margin of P around the dots.
const S = 100
const P = 26

/** A Dots and Boxes board: the dots and the grooves between them. Static, nothing to click. */
export function DotsBoard({ cols = 4, rows = 4 }: DotsBoardProps) {
  const dots = Array.from({ length: (rows + 1) * (cols + 1) }, (_, i) => ({
    x: (i % (cols + 1)) * S,
    y: Math.floor(i / (cols + 1)) * S,
  }))

  return (
    <div className="rounded-[1.75rem] bg-linear-to-b from-brand-500 to-brand-700 p-2 shadow-[0_10px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:p-2.5">
      <div className="rounded-[1.4rem] bg-night-950 p-3 shadow-[inset_0_4px_12px_rgb(0_0_0/0.8)] sm:p-5">
        <svg
          viewBox={`${-P} ${-P} ${cols * S + 2 * P} ${rows * S + 2 * P}`}
          className="block w-full"
          role="img"
          aria-label={`Empty Dots and Boxes board, ${cols} by ${rows} boxes`}
        >
          {/* Grooves where lines can go */}
          {dots.map(({ x, y }, i) => (
            <g key={`g${i}`} stroke="var(--color-night-800)" strokeWidth={10} strokeLinecap="round">
              {x < cols * S && <line x1={x} y1={y} x2={x + S} y2={y} />}
              {y < rows * S && <line x1={x} y1={y} x2={x} y2={y + S} />}
            </g>
          ))}
          {/* Dots */}
          {dots.map(({ x, y }, i) => (
            <g key={`d${i}`}>
              <circle cx={x} cy={y + 2.5} r={10} fill="rgb(0 0 0 / 0.5)" />
              <circle cx={x} cy={y} r={10} fill="var(--color-night-100)" />
              <circle cx={x - 3} cy={y - 3} r={3.5} fill="white" opacity={0.7} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
