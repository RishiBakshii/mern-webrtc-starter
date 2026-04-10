import { useEffect, useState } from 'react'
import { clearLocalMediaStream, ensureLocalMediaStream } from '../lib/webrtc/localMedia'

export const useLocalMediaStream = () => {
  const [myStream, setMyStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let mounted = true
    let localStream: MediaStream | null = null

    const initMedia = async () => {
      try {
        const stream = await ensureLocalMediaStream()

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        localStream = stream
        setMyStream(stream)
      } catch (error) {
        console.error('Error accessing media devices:', error)
      }
    }

    void initMedia()

    return () => {
      mounted = false
      if (localStream) {
        clearLocalMediaStream()
      }
      setMyStream(null)
    }
  }, [setMyStream])

  return { myStream }
}
