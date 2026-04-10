import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSocket } from '../context/socket.context'
import { useIceCandidateListener } from '../hooks/useIceCandidateListener'
import { useJoinRoom } from '../hooks/useJoinRoom'
import { useLocalMediaStream } from '../hooks/useLocalMediaStream'
import { useOtherPersonJoined } from '../hooks/useOtherPersonJoined'
import { useRoomJoinedConfirmation } from '../hooks/useRoomJoinedConfirmation'
import { useWebRtcAnswer } from '../hooks/useWebRtcAnswer'
import { useWebRtcIceCandidate } from '../hooks/useWebRtcIceCandidate'
import { useWebRtcOffer } from '../hooks/useWebRtcOffer'
import { useRemoteTrackListener } from '../hooks/useRemoteTrackListener'
import { useRoomChat } from '../hooks/useRoomChat'
import { useScreenShare } from '../hooks/useScreenShare'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { CameraIcon, MicIcon } from '../components/room/CallControlIcons'
import { useAuth } from '../context/auth.context'
import { handleDraggablePointerDown } from '../lib/utils'

export const RoomPage = () => {
  const { roomId } = useParams()
  const { socket, isConnected, connectSocket } = useSocket()
  const { user } = useAuth()

  const [selfViewOffset, setSelfViewOffset] = useState({ x: 0, y: 0 })
  const [screenShareViewOffset, setScreenShareViewOffset] = useState({ x: 0, y: 0 })
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(
    null,
  )
  const screenShareDragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(
    null,
  )

  // remote socket id
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null)

  // remote user details
  const [remoteUser, setRemoteUser] = useState<{ userId: string; username: string; email: string } | null>(null)

  const { screenShareStream, handleShareScreen } = useScreenShare()

  useEffect(() => {
    if (!screenShareStream) {
      setScreenShareViewOffset({ x: 0, y: 0 })
    }
  }, [screenShareStream])

  const handleSelfViewPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    handleDraggablePointerDown(event, selfViewOffset, dragStartRef, setSelfViewOffset)
  }

  const handleScreenSharePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    handleDraggablePointerDown(event, screenShareViewOffset, screenShareDragStartRef, setScreenShareViewOffset)
  }

  const { myStream } = useLocalMediaStream()
  const { isMicOn, isCameraOn, handleMicToggle, handleCameraToggle } = useUserPreferences(myStream)
  useJoinRoom({ roomId, socket, isConnected, connectSocket })
  useRoomJoinedConfirmation(socket)
  useOtherPersonJoined(socket,setRemoteSocketId,setRemoteUser)
  useWebRtcOffer(socket)
  useWebRtcAnswer(socket)
  useWebRtcIceCandidate(socket)
  useIceCandidateListener({ socket, roomId, remoteSocketId })
  const { remoteStream, remoteAudioStream, remoteVideoStream } = useRemoteTrackListener()
  const { messages, chatInput, setChatInput, handleChatSubmit } = useRoomChat(socket, roomId)

  const hasLiveRemoteVideo = Boolean(
    remoteVideoStream?.getVideoTracks().some((track) => track.enabled && track.readyState === 'live'),
  )
  const isRemoteMicEnabled = remoteAudioStream?.getAudioTracks()[0]?.enabled ?? false
  const isRemoteCameraEnabled = remoteVideoStream?.getVideoTracks()[0]?.enabled ?? false

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100">
      <div className="flex h-[calc(100vh-2rem)] w-full gap-4">
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs">
            <span className="font-medium text-slate-300">Debug</span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-200">
              remoteMic: {isRemoteMicEnabled ? 'on' : 'off'}
            </span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-200">
              remoteCamera: {isRemoteCameraEnabled ? 'on' : 'off'}
            </span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-200">
              remoteAudioStream: {remoteAudioStream ? 'available' : 'none'}
            </span>
            <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-200">
              remoteVideoStream: {remoteVideoStream ? 'available' : 'none'}
            </span>
          </div>

          <header className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Room</p>
              <h1 className="text-lg font-semibold">{roomId}</h1>
            </div>
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Back to dashboard
            </Link>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex h-full min-h-[380px] w-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950">
              <div className="flex flex-col items-center gap-3">
                {
                  remoteUser || Boolean(remoteStream) || Boolean(remoteSocketId) ? (
                    <div className="flex flex-col items-center gap-3">
                      {remoteSocketId && !hasLiveRemoteVideo ? (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-800/80">
                          <span className="text-xl font-semibold text-slate-200">
                            {(remoteUser?.username?.trim()?.charAt(0) || '?').toUpperCase()}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5">
                        <p className="text-sm text-slate-300">{remoteUser?.username}</p>
                        <span
                          className={
                            remoteAudioStream?.getAudioTracks().some((track) => track.enabled && track.readyState === 'live')
                              ? 'text-slate-300'
                              : 'text-red-300'
                          }
                        >
                          <MicIcon
                            muted={
                              !remoteAudioStream?.getAudioTracks().some((track) => track.enabled && track.readyState === 'live')
                            }
                          />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                    <p className="text-sm text-slate-500">Waiting for other person...</p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                      </div>
                    </>
                  )
                }
              </div>
              {hasLiveRemoteVideo && remoteVideoStream ? (
                <video
                  autoPlay
                  playsInline
                  className="absolute inset-0 h-full w-full rounded-xl object-cover"
                  ref={(video) => {
                    if (video) video.srcObject = remoteVideoStream
                  }}
                />
              ) : remoteSocketId ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/80">
                  <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-slate-300">
                    <CameraIcon off />
                    <span className="text-sm">Camera off</span>
                  </div>
                </div>
              ) : null}
            </div>

            {screenShareStream ? (
              <div
                className="absolute bottom-4 left-4 h-40 w-64 cursor-move overflow-hidden rounded-xl border border-indigo-500/50 bg-slate-950/95 shadow-lg shadow-black/40"
                onPointerDown={handleScreenSharePointerDown}
                style={{ transform: `translate(${screenShareViewOffset.x}px, ${screenShareViewOffset.y}px)` }}
              >
                <video
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-contain bg-black"
                  ref={(video) => {
                    if (video) video.srcObject = screenShareStream
                  }}
                />
                <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-indigo-400/60 bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-indigo-200">
                  Sharing screen
                </div>
              </div>
            ) : null}

            <div
              className="absolute bottom-4 right-4 h-28 w-44 cursor-move overflow-hidden rounded-xl border border-slate-700 bg-slate-950/90 shadow-lg shadow-black/30"
              onPointerDown={handleSelfViewPointerDown}
              style={{ transform: `translate(${selfViewOffset.x}px, ${selfViewOffset.y}px)` }}
            >
              {isCameraOn && myStream ? (
                <video
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  ref={(video) => {
                    if (video) video.srcObject = myStream
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-sm font-medium text-slate-300">{!isCameraOn && isMicOn ? 'You (audio only)' : 'You'}</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 rounded-full border border-slate-700 bg-slate-900/80 p-1">
                <span
                  className={
                    isMicOn
                      ? 'text-slate-300'
                      : 'text-red-300'
                  }
                >
                  <MicIcon
                    muted={!isMicOn}
                  />
                </span>
              </div>
            </div>
            <audio
              autoPlay
              ref={(audio) => {
                if (audio) audio.srcObject = remoteAudioStream
              }}
            />
          </div>

          <footer className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleMicToggle}
                aria-label={isMicOn ? 'Turn microphone off' : 'Turn microphone on'}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isMicOn
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                }`}
              >
                <MicIcon muted={!isMicOn} />
              </button>

              <button
                type="button"
                onClick={handleCameraToggle}
                aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isCameraOn
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                }`}
              >
                <CameraIcon off={!isCameraOn} />
              </button>

              <button
                type="button"
                onClick={handleShareScreen}
                aria-label={screenShareStream ? 'Stop sharing screen' : 'Share screen'}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  screenShareStream
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                }`}
              >
                {screenShareStream ? 'Stop sharing' : 'Share screen'}
              </button>

              <button
                type="button"
                className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
              >
                Leave
              </button>
            </div>
          </footer>
        </section>

        <aside className="hidden w-[330px] shrink-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:flex lg:flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">In-call chat</h2>
            <span className="text-xs text-slate-400">0 online</span>
          </div>

          <div className="mb-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500">No messages yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {messages.map((entry) => {
                  const isOwnMessage = Boolean(user?.id && entry.senderUserId === user.id)
                  return (
                    <li
                      key={`${entry.sentAt}-${entry.senderUserId}-${entry.message.slice(0, 20)}`}
                      className="text-xs"
                    >
                      <span className="font-medium text-indigo-300">
                        {isOwnMessage ? 'You' : entry.sender.username}
                      </span>
                      <span className="text-slate-500"> · </span>
                      <span className="text-slate-200">{entry.message}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
            >
              Send
            </button>
          </form>
        </aside>
      </div>
    </main>
  )
}
