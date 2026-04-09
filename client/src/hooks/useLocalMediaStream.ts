import { useEffect } from 'react'
import type React from 'react'
import { peer } from '../lib/webrtc/peer'

type UseLocalMediaStreamParams = {
  setMyStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
  setMyAudioStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
  setMyVideoStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
}

export const useLocalMediaStream = ({
  setMyStream,
  setMyAudioStream,
  setMyVideoStream,
}: UseLocalMediaStreamParams) => {
  useEffect(() => {
    let mounted = true
    let localStream: MediaStream | null = null

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        localStream = stream
        setMyStream(stream)
        const audioTrack = stream.getAudioTracks()[0]
        const videoTrack = stream.getVideoTracks()[0]
        setMyAudioStream(audioTrack ? new MediaStream([audioTrack]) : null)
        setMyVideoStream(videoTrack ? new MediaStream([videoTrack]) : null)

        peer.ensurePeerConnection()

        stream.getTracks().forEach((track) => {
          peer.peer?.addTrack(track, stream)
        })
      } catch (error) {
        console.error('Error accessing media devices:', error)
      }
    }

    void initMedia()

    return () => {
      mounted = false
      localStream?.getTracks().forEach((track) => track.stop())
      setMyStream(null)
      setMyAudioStream(null)
      setMyVideoStream(null)
    }
  }, [setMyStream, setMyAudioStream, setMyVideoStream])
}
