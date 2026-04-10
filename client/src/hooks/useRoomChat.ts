import { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { Socket } from 'socket.io-client'
import { SOCKET_EVENTS } from '../socket/events'

export interface RoomChatMessage {
  roomId: string
  message: string
  /** Same as sender.userId; included at top level for easy “You” checks on the client */
  senderUserId: string
  sender: { userId: string; username: string; email: string }
  sentAt: string
}

export const useRoomChat = (socket: Socket | null, roomId: string | undefined) => {
  const [messages, setMessages] = useState<RoomChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')

  const addMessage = useCallback((payload: RoomChatMessage) => {
    setMessages((prev) => [...prev, payload])
  }, [])

  useEffect(() => {
    if (!socket || !roomId) return

    const handleReceiveMessage = (payload: RoomChatMessage) => {
      if (payload.roomId !== roomId) return
      addMessage({
        ...payload,
        senderUserId: payload.senderUserId ?? payload.sender.userId,
      })
    }

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
    }
  }, [socket, roomId, addMessage])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!socket || !roomId || !trimmed) return
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, { roomId, message: trimmed })
    },
    [socket, roomId],
  )

  const handleChatSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!chatInput.trim()) return
      sendMessage(chatInput)
      setChatInput('')
    },
    [chatInput, sendMessage],
  )

  return { messages, chatInput, setChatInput, handleChatSubmit }
}
