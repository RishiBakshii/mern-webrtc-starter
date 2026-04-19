import { useCallback, useState } from 'react'
import { useSocket } from '../context/socket.context'
import { SOCKET_EVENTS } from '../socket/events'
import { peer } from '../lib/webrtc/peer'

type UseScreenShareOptions = {
  roomId?: string
  toSocketId?: string | null
}

/**
 * Display capture for screen sharing: local preview + adds a video track to the peer connection.
 */
export const useScreenShare = ({ roomId, toSocketId }: UseScreenShareOptions = {}) => {
  const { socket } = useSocket()
  const [userScreenShareStream, setUserScreenShareStream] = useState<MediaStream | null>(null)

  const stopScreenShare = useCallback(() => {
    setUserScreenShareStream((prev) => {
      prev?.getVideoTracks().forEach((t) => {
        t.onended = null
        t.stop()
      })
      return null
    })
    peer.removeScreenShareTrack()
    if (roomId && toSocketId) {
      socket?.emit(SOCKET_EVENTS.SCREEN_SHARE_STOP, { roomId, toSocketId })
    }
  }, [socket, roomId, toSocketId])

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare()
        }
      }

      setUserScreenShareStream(stream)
      peer.addScreenShareTrack(stream)
    } catch {
      // User dismissed the picker or permission denied
    }
  }, [stopScreenShare])

  const toggleScreenShare = useCallback(() => {
    if (userScreenShareStream) {
      stopScreenShare()
    } else {
      void startScreenShare()
    }
  }, [userScreenShareStream, startScreenShare, stopScreenShare])

  return {
    userScreenShareStream,
    isScreenSharing: Boolean(userScreenShareStream),
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  }
}
