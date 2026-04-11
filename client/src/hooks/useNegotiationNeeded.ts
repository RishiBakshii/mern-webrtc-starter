import { useCallback, useEffect, useRef } from 'react'
import type { Socket } from 'socket.io-client'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'
import toast from 'react-hot-toast'

type UseNegotiationNeededParams = {
  socket: Socket | null
  roomId: string | undefined
  remoteSocketId: string | null
  /** When false, do not subscribe (e.g. pre-join lobby). */
  enabled?: boolean
}

/**
 * When the RTCPeerConnection needs renegotiation (e.g. add/replace track), creates a new offer
 * and signals it the same way as the initial call (`WEBRTC_OFFER` → answer flow).
 */
export const useNegotiationNeeded = ({
  socket,
  roomId,
  remoteSocketId,
  enabled = true,
}: UseNegotiationNeededParams) => {
  const makingOfferRef = useRef(false)

  const handleNegoNeeded = useCallback(async () => {
    if (!enabled || !socket || !roomId || !remoteSocketId) return
    if (!peer.peer) return
    if (makingOfferRef.current) return

    makingOfferRef.current = true
    try {
      const offer = await peer.getOffer()
      if (!offer) return

      socket.emit(SOCKET_EVENTS.WEBRTC_NEGOTIATION_NEEDED, {
        roomId,
        toSocketId: remoteSocketId,
        offer,
      })
      toast.success(`You have sent your renegotiation needed offer successfully`)
    } catch (err) {
      console.error('negotiationneeded: failed to create/send offer', err)
    } finally {
      makingOfferRef.current = false
    }
  }, [enabled, socket, roomId, remoteSocketId])

  useEffect(() => {
    if (!enabled || !socket || !roomId || !remoteSocketId) return

    peer.peer?.addEventListener('negotiationneeded', handleNegoNeeded)
    return () => {
      peer.peer?.removeEventListener('negotiationneeded', handleNegoNeeded)
    }
  }, [handleNegoNeeded, enabled, socket, roomId, remoteSocketId])
}
