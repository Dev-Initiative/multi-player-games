import { Lightbulb, Sparkles } from 'lucide-react'
import { Button } from '../../shared/ui/Button'
import { Panel } from '../../shared/ui/Panel'

export function SuggestGame() {
  return (
    <Panel className="mt-16 flex flex-col items-start gap-6 rounded-[2rem] p-8 sm:flex-row sm:items-center">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-sun/15 text-sun ring-1 ring-sun/30">
        <Lightbulb className="size-7" strokeWidth={2.25} aria-hidden />
      </span>
      <div className="flex-1">
        <h3 className="text-2xl font-extrabold">Got a game we should add?</h3>
        <p className="mt-1 text-night-300">
          Anything turn-based works. Tell us what your group plays and we'll put it in the workshop.
        </p>
      </div>
      <Button variant="sun" icon={Sparkles}>
        Suggest a game
      </Button>
    </Panel>
  )
}
