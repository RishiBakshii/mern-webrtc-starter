import { useEffect } from 'react'
import toast from 'react-hot-toast'
import type { Socket } from 'socket.io-client'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'

type NegotiationAnswerPayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
  answer: unknown
}

/**
 * Applies incoming renegotiation answers (`WEBRTC_NEGOTIATION_ANSWER`) to the peer connection.
 * Initial answers use {@link useWebRtcAnswer} (`WEBRTC_ANSWER` only).
 */
export const useNegotiationRemoteAnswer = (socket: Socket | null) => {
  useEffect(() => {
    if (!socket) return

    const handler = (payload: NegotiationAnswerPayload) => {
      void (async () => {
        await peer.setRemoteDescription(payload.answer as RTCSessionDescriptionInit)
        toast.success(`Renegotiation answer received from ${payload.fromUser.username}`)
      })()
    }

    socket.on(SOCKET_EVENTS.WEBRTC_NEGOTIATION_ANSWER, handler)

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_NEGOTIATION_ANSWER, handler)
    }
  }, [socket])
}
