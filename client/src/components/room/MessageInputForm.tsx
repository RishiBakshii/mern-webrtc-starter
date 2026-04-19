import { type FormEvent } from 'react'
import { SendIcon } from '../ui/SendIcon'

export type MessageInputFormProps = {
  chatInput: string
  setChatInput: (value: string) => void
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function MessageInputForm({
  chatInput,
  setChatInput,
  handleChatSubmit,
}: MessageInputFormProps) {
  return (
    <form onSubmit={handleChatSubmit} className="flex shrink-0 gap-2">
      <input
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Type a message..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      />
      <button
        type="submit"
        aria-label="Send message"
        className="grid shrink-0 place-items-center rounded-lg bg-indigo-500 px-3 py-2 text-white transition hover:bg-indigo-400"
      >
        <SendIcon />
      </button>
    </form>
  )
}
