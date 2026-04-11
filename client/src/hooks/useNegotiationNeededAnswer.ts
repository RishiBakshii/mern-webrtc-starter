import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'

type NegotiationNeededPayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
  offer: unknown
}

/**
 * Listens for `WEBRTC_NEGOTIATION_NEEDED`, builds an answer, emits `WEBRTC_NEGOTIATION_ANSWER`.
 */
export const useNegotiationNeededAnswer = (socket: Socket | null) => {
  useEffect(() => {
    if (!socket) return

    const handler = (payload: NegotiationNeededPayload) => {
      toast.success("negotiation needed event received")
      void (async () => {
        const answer = await peer.getAnswer(payload.offer as RTCSessionDescriptionInit)
        if (!answer) {
          toast.error('Failed to create WebRTC answer for renegotiation')
          return
        }

        socket.emit(SOCKET_EVENTS.WEBRTC_NEGOTIATION_ANSWER, {
          roomId: payload.roomId,
          toSocketId: payload.fromSocketId,
          answer,
        })
        toast.success("negotiation needed answer sent successfully")
      })()
    }

    socket.on(SOCKET_EVENTS.WEBRTC_NEGOTIATION_NEEDED, handler)

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_NEGOTIATION_NEEDED, handler)
    }
  }, [socket])
}
