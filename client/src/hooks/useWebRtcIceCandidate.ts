import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'

type WebRtcIceCandidatePayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
  candidate: RTCIceCandidateInit
}

export const useWebRtcIceCandidate = (socket: Socket | null) => {
  
  useEffect(() => {
    if (!socket) return

    const handleWebRtcIceCandidate = (payload: WebRtcIceCandidatePayload) => {
      void (async () => {
        await peer.peer?.addIceCandidate(new RTCIceCandidate(payload.candidate))
      })()
    }

    socket.on(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, handleWebRtcIceCandidate)

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, handleWebRtcIceCandidate)
    }
  }, [socket])
}
