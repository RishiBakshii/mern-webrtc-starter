import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { peer } from '../lib/webrtc/peer'
import { ensureLocalMediaStream } from '../lib/webrtc/localMedia'
import { SOCKET_EVENTS } from '../socket/events'

type OtherPersonJoinedPayload = {
  roomId: string
  joinedSocketId: string
  user: { userId: string; username: string; email: string }
}

export const useOtherPersonJoined = (socket: Socket | null, setRemoteSocketId: (socketId: string) => void, setRemoteUser: (user: { userId: string; username: string; email: string }) => void) => {
  useEffect(() => {
    if (!socket) return

    const handleOtherPersonJoined = (payload: OtherPersonJoinedPayload) => {
      toast.success(`${payload.user.username} joined room ${payload.roomId}`)
      setRemoteSocketId(payload.joinedSocketId)
      setRemoteUser(payload.user)
      void (async () => {
        const localStream = await ensureLocalMediaStream()
        await peer.attachLocalStream(localStream)

        const offer = await peer.getOffer()
        if (!offer) {
          toast.error('Failed to create WebRTC offer')
          return
        }

        socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, {
          roomId: payload.roomId,
          toSocketId: payload.joinedSocketId,
          offer,
        })
      })()
    }

    socket.on(SOCKET_EVENTS.OTHER_PERSON_JOINED, handleOtherPersonJoined)

    return () => {
      socket.off(SOCKET_EVENTS.OTHER_PERSON_JOINED, handleOtherPersonJoined)
    }
  }, [socket])
}
