import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { SOCKET_EVENTS } from '../socket/events'

type ScreenShareStopPayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
}

type UseScreenShareStopListenerParams = {
  socket: Socket | null
  roomId?: string
  remoteSocketId: string | null
  onRemoteScreenShareStopped: () => void
}

/**
 * When the peer signals they stopped screen sharing (socket relay), toast and clear remote UI state.
 */
export const useScreenShareStopListener = ({
  socket,
  roomId,
  remoteSocketId,
  onRemoteScreenShareStopped,
}: UseScreenShareStopListenerParams) => {
  useEffect(() => {
    if (!socket) return

    const handleScreenShareStop = (payload: ScreenShareStopPayload) => {
      if (roomId && payload.roomId !== roomId) return
      if (!remoteSocketId || payload.fromSocketId !== remoteSocketId) return

      toast.success(`${payload.fromUser.username} stopped screen sharing`)
      onRemoteScreenShareStopped()
    }

    socket.on(SOCKET_EVENTS.SCREEN_SHARE_STOP, handleScreenShareStop)

    return () => {
      socket.off(SOCKET_EVENTS.SCREEN_SHARE_STOP, handleScreenShareStop)
    }
  }, [socket, roomId, remoteSocketId, onRemoteScreenShareStopped])
}
