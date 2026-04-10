let localMediaStream: MediaStream | null = null
let localMediaPromise: Promise<MediaStream> | null = null

export const ensureLocalMediaStream = async () => {
  if (localMediaStream) return localMediaStream
  if (localMediaPromise) return localMediaPromise

  localMediaPromise = navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      localMediaStream = stream
      return stream
    })
    .finally(() => {
      localMediaPromise = null
    })

  return localMediaPromise
}

export const clearLocalMediaStream = () => {
  localMediaStream?.getTracks().forEach((track) => track.stop())
  localMediaStream = null
}
