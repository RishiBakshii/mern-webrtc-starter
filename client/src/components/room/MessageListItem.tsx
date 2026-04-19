import type { RoomChatMessage } from '../../hooks/useRoomChat'

export type MessageListItemProps = {
  entry: RoomChatMessage
  userId: string | undefined
}

export function MessageListItem({ entry, userId }: MessageListItemProps) {
  const isOwnMessage = Boolean(userId && entry.senderUserId === userId)

  return (
    <li className="text-xs">
      <span className="font-medium text-indigo-300">
        {isOwnMessage ? 'You' : entry.sender.username}
      </span>
      <span className="text-slate-500"> · </span>
      <span className="text-slate-200">{entry.message}</span>
    </li>
  )
}
