import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { SOCKET_EVENTS } from '../socket/events'

type UseJoinRoomParams = {
  roomId?: string
  socket: Socket | null
  isConnected: boolean
  connectSocket: () => void
}

export const useJoinRoom = ({ roomId, socket, isConnected, connectSocket }: UseJoinRoomParams) => {
  useEffect(() => {
    if (!roomId) return

    if (!isConnected) {
      connectSocket()
      return
    }

    socket?.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId })
  }, [roomId, socket, isConnected, connectSocket])
}
