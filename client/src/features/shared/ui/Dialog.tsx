import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

type DialogProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Buttons along the bottom. */
  actions?: ReactNode
}

/** Modal built on the native <dialog>: focus trap, Escape and top layer come free. */
export function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="panel m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl p-0 text-night-50 open:animate-pop backdrop:bg-night-950/75 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 -mr-2 grid size-9 place-items-center rounded-xl text-night-300 hover:bg-white/8 hover:text-white"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="text-night-200">{children}</div>
        {actions && <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div>}
      </div>
    </dialog>
  )
}
