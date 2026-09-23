type Connect4BoardProps = {
  cols?: number
  rows?: number
}

/** A Connect 4 board: the frame and its empty holes. Static, nothing to click. */
export function Connect4Board({ cols = 7, rows = 6 }: Connect4BoardProps) {
  return (
    <div
      role="img"
      aria-label={`Empty Connect 4 board, ${cols} columns by ${rows} rows`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      className="grid gap-2 rounded-[1.75rem] bg-linear-to-b from-brand-500 to-brand-700 p-3 shadow-[0_10px_0_0_var(--color-brand-900),inset_0_2px_0_rgb(255_255_255/0.3),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:gap-3 sm:p-4"
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <span key={i} className="aspect-square rounded-full bg-night-950 shadow-[inset_0_4px_6px_rgb(0_0_0/0.75)]" />
      ))}
    </div>
  )
}
