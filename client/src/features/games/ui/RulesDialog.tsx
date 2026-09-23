import { Dialog } from '../../shared/ui/Dialog'
import { Button } from '../../shared/ui/Button'

type RulesDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  rules: string[]
}

/** How to play, as a short numbered list. */
export function RulesDialog({ open, onClose, title, rules }: RulesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`How to play ${title}`}
      actions={<Button onClick={onClose}>Got it</Button>}
    >
      <ol className="space-y-3">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-500/15 font-display text-sm font-extrabold text-brand-400 ring-1 ring-brand-500/30">
              {i + 1}
            </span>
            <span className="pt-0.5 text-night-100">{rule}</span>
          </li>
        ))}
      </ol>
    </Dialog>
  )
}
