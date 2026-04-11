import { useCallback, useEffect, useRef, useState } from 'react'
import { peer } from '../lib/webrtc/peer'

type UseRemoteTrackListenerParams = {
  /** When set, re-bind listeners after RTCPeerConnection exists (e.g. joiner after offer). */
  remoteSocketId: string | null
}

/**
 * Whether this incoming video track is the other peer’s screen share (display capture), not their camera.
 * Note: received tracks often omit `displaySurface` — we also treat a second live video as screen (below).
 */
function isRemoteScreenShareTrack(track: MediaStreamTrack): boolean {
  if (track.kind !== 'video') return false

  const settings = track.getSettings() as MediaTrackSettings & { displaySurface?: string }
  if (settings.displaySurface) return true

  const label = track.label.toLowerCase()
  return (
    label.includes('screen') ||
    label.includes('window') ||
    label.includes('display') ||
    label.includes('entire') ||
    label.includes('tab')
  )
}

type UseRemoteTrackListenerResult = {
  remoteStream: MediaStream | null
  remoteAudioStream: MediaStream | null
  remoteVideoStream: MediaStream | null
  remoteScreenShareStream: MediaStream | null
}

export const useRemoteTrackListener = ({
  remoteSocketId,
}: UseRemoteTrackListenerParams): UseRemoteTrackListenerResult => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [remoteAudioStream, setRemoteAudioStream] = useState<MediaStream | null>(null)
  const [remoteVideoStream, setRemoteVideoStream] = useState<MediaStream | null>(null)
  const [remoteScreenShareStream, setRemoteScreenShareStream] = useState<MediaStream | null>(null)

  /** Track currently shown as remote camera; used to detect a second live video (screen) when metadata is missing. */
  const remoteCameraTrackRef = useRef<MediaStreamTrack | null>(null)

  const handleRemoteStream = useCallback((event: RTCTrackEvent) => {
    const incomingRemoteStream = event.streams[0]
    if (!incomingRemoteStream) return

    setRemoteStream(incomingRemoteStream)

    const track = event.track

    if (track.kind === 'audio') {
      console.log('received audio track', track)
      setRemoteAudioStream(new MediaStream([track]))
      const onEnded = () => {
        track.removeEventListener('ended', onEnded)
        setRemoteAudioStream((prev) => (prev?.getAudioTracks()[0]?.id === track.id ? null : prev))
      }
      track.addEventListener('ended', onEnded)
      return
    }

    if (track.kind === 'video') {
      console.log('received video track', track)

      if (isRemoteScreenShareTrack(track)) {
        setRemoteScreenShareStream(new MediaStream([track]))
        const onEnded = () => {
          track.removeEventListener('ended', onEnded)
          setRemoteScreenShareStream((prev) =>
            prev?.getVideoTracks()[0]?.id === track.id ? null : prev,
          )
        }
        track.addEventListener('ended', onEnded)
        return
      }

      const prevCamera = remoteCameraTrackRef.current
      if (
        prevCamera &&
        prevCamera.id !== track.id &&
        prevCamera.readyState === 'live'
      ) {
        setRemoteScreenShareStream(new MediaStream([track]))
        const onEnded = () => {
          track.removeEventListener('ended', onEnded)
          setRemoteScreenShareStream((prev) =>
            prev?.getVideoTracks()[0]?.id === track.id ? null : prev,
          )
        }
        track.addEventListener('ended', onEnded)
        return
      }

      remoteCameraTrackRef.current = track
      setRemoteVideoStream(new MediaStream([track]))
      const onEnded = () => {
        track.removeEventListener('ended', onEnded)
        if (remoteCameraTrackRef.current?.id === track.id) {
          remoteCameraTrackRef.current = null
        }
        setRemoteVideoStream((prev) => (prev?.getVideoTracks()[0]?.id === track.id ? null : prev))
      }
      track.addEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    peer.peer?.addEventListener('track', handleRemoteStream)
    return () => {
      peer.peer?.removeEventListener('track', handleRemoteStream)
    }
  }, [handleRemoteStream, remoteSocketId])

  return { remoteStream, remoteAudioStream, remoteVideoStream, remoteScreenShareStream }
}
