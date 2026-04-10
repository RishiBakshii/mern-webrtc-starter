import { useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import toast from 'react-hot-toast'
import { peer } from '../lib/webrtc/peer'
import { ensureLocalMediaStream } from '../lib/webrtc/localMedia'
import { SOCKET_EVENTS } from '../socket/events'

type WebRtcOfferPayload = {
  roomId: string
  fromSocketId: string
  fromUser: { userId: string; username: string; email: string }
  offer: unknown
}

export const useWebRtcOffer = (socket: Socket | null) => {
  useEffect(() => {
    if (!socket) return

    const handleWebRtcOffer = (payload: WebRtcOfferPayload) => {
      void (async () => {
        console.log('Remote WEBRTC_OFFER received:', payload)
        toast.success(`Remote offer received from ${payload.fromUser.username}`)

        const localStream = await ensureLocalMediaStream()
        await peer.attachLocalStream(localStream)

        const answer = await peer.getAnswer(payload.offer as RTCSessionDescriptionInit)
        if (!answer) {
          toast.error('Failed to create WebRTC answer')
          return
        }

        socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
          roomId: payload.roomId,
          toSocketId: payload.fromSocketId,
          answer,
        })
      })()
    }

    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, handleWebRtcOffer)

    return () => {
      socket.off(SOCKET_EVENTS.WEBRTC_OFFER, handleWebRtcOffer)
    }
  }, [socket])
}
