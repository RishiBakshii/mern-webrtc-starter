import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'

type WebRtcAnswerPayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
  answer: unknown
}

export const useWebRtcAnswer = (socket: Socket | null) => {
  useEffect(() => {
    if (!socket) return

    const handleWebRtcAnswer = (payload: WebRtcAnswerPayload) => {
      void (async () => {
        console.log('Remote WEBRTC_ANSWER received:', payload)
        await peer.setRemoteDescription(payload.answer as RTCSessionDescriptionInit)
        toast.success(`Remote answer received from ${payload.fromUser.username}`)
      })()
    }

    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, handleWebRtcAnswer)

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_ANSWER, handleWebRtcAnswer)
    }
  }, [socket])
}
