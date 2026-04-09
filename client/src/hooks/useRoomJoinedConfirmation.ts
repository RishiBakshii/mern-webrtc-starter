import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { SOCKET_EVENTS } from '../socket/events'

type RoomJoinedPayload = { roomId: string }

export const useRoomJoinedConfirmation = (socket: Socket | null) => {
  useEffect(() => {
    if (!socket) return

    const handleRoomJoinedConfirmation = (payload: RoomJoinedPayload) => {
      toast.success(`Joined room: ${payload.roomId}`)
    }

    socket.on(SOCKET_EVENTS.ROOM_JOINED_CONFIRMATION, handleRoomJoinedConfirmation)

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_JOINED_CONFIRMATION, handleRoomJoinedConfirmation)
    }
  }, [socket])
}
