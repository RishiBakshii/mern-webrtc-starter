import { useCallback, useEffect } from 'react'
import type React from 'react'
import { peer } from '../lib/webrtc/peer'

type UseRemoteTrackListenerParams = {
  setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
  setRemoteAudioStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
  setRemoteVideoStream: React.Dispatch<React.SetStateAction<MediaStream | null>>
}

export const useRemoteTrackListener = ({
  setRemoteStream,
  setRemoteAudioStream,
  setRemoteVideoStream,
}: UseRemoteTrackListenerParams) => {
  
  const handleRemoteStream = useCallback(
    (event: RTCTrackEvent) => {
      const incomingRemoteStream = event.streams[0]
      if (!incomingRemoteStream) return

      setRemoteStream(incomingRemoteStream)

      const audioTrack = incomingRemoteStream.getAudioTracks()[0]
      const videoTrack = incomingRemoteStream.getVideoTracks()[0]

      console.log('received audio track', audioTrack)
      console.log('received video track', videoTrack)

      const receivedAudioStream = audioTrack ? new MediaStream([audioTrack]) : null
      const receivedVideoStream = videoTrack ? new MediaStream([videoTrack]) : null

      setRemoteAudioStream(receivedAudioStream)
      setRemoteVideoStream(receivedVideoStream)
    },
    [setRemoteStream, setRemoteAudioStream, setRemoteVideoStream],
  )

  useEffect(() => {
    peer.peer?.addEventListener('track', handleRemoteStream)
    return () => {
      peer.peer?.removeEventListener('track', handleRemoteStream)
    }
  }, [handleRemoteStream])
}
