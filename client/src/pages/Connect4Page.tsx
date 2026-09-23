import { Connect4Board } from '../features/connect4/ui/Connect4Board'

export function Connect4Page() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[36rem]">
        <Connect4Board />
      </div>
    </main>
  )
}
