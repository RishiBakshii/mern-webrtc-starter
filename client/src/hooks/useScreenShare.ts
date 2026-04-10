import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export const useScreenShare = () => {
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null)

  const handleShareScreen = useCallback(async () => {
    if (screenShareStream) {
      screenShareStream.getTracks().forEach((track) => track.stop())
      setScreenShareStream(null)
      toast.success('Screen sharing stopped')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      })

      const videoTrack = stream.getVideoTracks()[0]
      videoTrack?.addEventListener('ended', () => {
        stream.getTracks().forEach((track) => track.stop())
        setScreenShareStream((current) => (current === stream ? null : current))
      })

      setScreenShareStream(stream)
      toast.success('Screen sharing started')
    } catch {
      toast.error('Could not share screen (cancelled or not allowed).')
    }
  }, [screenShareStream])

  useEffect(() => {
    return () => {
      screenShareStream?.getTracks().forEach((track) => track.stop())
    }
  }, [screenShareStream])

  return { screenShareStream, handleShareScreen }
}
