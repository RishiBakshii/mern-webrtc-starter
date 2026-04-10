import { useCallback, useState } from 'react'

export const useUserPreferences = (myStream: MediaStream | null) => {
  const [isMicOn, setIsMicOn] = useState<boolean>(true)
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true)

  const handleMicToggle = useCallback(() => {
    const audioTrack = myStream?.getAudioTracks()[0]
    if (!audioTrack) {
      setIsMicOn((prev) => !prev)
      return
    }

    audioTrack.enabled = !audioTrack.enabled
    setIsMicOn(audioTrack.enabled)
  }, [myStream])

  const handleCameraToggle = useCallback(() => {
    const videoTrack = myStream?.getVideoTracks()[0]
    if (!videoTrack) {
      setIsCameraOn((prev) => !prev)
      return
    }

    videoTrack.enabled = !videoTrack.enabled
    setIsCameraOn(videoTrack.enabled)
  }, [myStream])

  return { isMicOn, isCameraOn, handleMicToggle, handleCameraToggle }
}
