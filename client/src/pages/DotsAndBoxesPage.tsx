import { DotsBoard } from '../features/dots/ui/DotsBoard'

export function DotsAndBoxesPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[34rem]">
        <DotsBoard />
      </div>
    </main>
  )
}
