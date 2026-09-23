export function Divider({ label }: { label?: string }) {
  if (!label) return <hr className="border-white/8" />
  return (
    <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-night-400 uppercase">
      <span className="h-px flex-1 bg-white/8" />
      {label}
      <span className="h-px flex-1 bg-white/8" />
    </div>
  )
}
