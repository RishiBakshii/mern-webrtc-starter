import { useCallback, useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import { peer } from '../lib/webrtc/peer'
import { SOCKET_EVENTS } from '../socket/events'

type UseIceCandidateListenerParams = {
  socket: Socket | null
  roomId?: string
  remoteSocketId: string | null
}

export const useIceCandidateListener = ({ socket, roomId, remoteSocketId }: UseIceCandidateListenerParams) => {
  
  const handleICECandidate = useCallback((event: RTCPeerConnectionIceEvent) => {
    if (!event.candidate) return
    if (!socket || !roomId || !remoteSocketId) return

    socket.emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, {
      roomId,
      toSocketId: remoteSocketId,
      candidate: event.candidate,
    })
  }, [socket, roomId, remoteSocketId])

  useEffect(() => {
    peer.peer?.addEventListener('icecandidate', handleICECandidate)
    return () => {
      peer.peer?.removeEventListener('icecandidate', handleICECandidate)
    }
  }, [handleICECandidate])
}
