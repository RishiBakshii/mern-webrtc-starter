import type { RoomChatMessage } from '../../hooks/useRoomChat'
import { MessageListItem } from './MessageListItem'

export type MessageListProps = {
  messages: RoomChatMessage[]
  userId: string | undefined
}

export function MessageList({ messages, userId }: MessageListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {messages.map((entry) => (
        <MessageListItem
          key={`${entry.sentAt}-${entry.senderUserId}-${entry.message.slice(0, 20)}`}
          entry={entry}
          userId={userId}
        />
      ))}
    </ul>
  )
}
