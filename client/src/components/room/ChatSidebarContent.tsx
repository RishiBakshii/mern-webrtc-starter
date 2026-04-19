import { type FormEvent } from 'react'
import type { RoomChatMessage } from '../../hooks/useRoomChat'
import { MessageInputForm } from './MessageInputForm'
import { MessageList } from './MessageList'

export type ChatSidebarContentProps = {
  messages: RoomChatMessage[]
  chatInput: string
  setChatInput: (value: string) => void
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
  userId: string | undefined
  variant: 'docked' | 'drawer'
  onClose?: () => void
}

export function ChatSidebarContent({
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  userId,
  variant,
  onClose,
}: ChatSidebarContentProps) {
  return (
    <>
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">In-call chat</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">0 online</span>
          {variant === 'drawer' && onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-500">No messages yet.</p>
        ) : (
          <MessageList messages={messages} userId={userId} />
        )}
      </div>

      <MessageInputForm
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleChatSubmit={handleChatSubmit}
      />
    </>
  )
}
