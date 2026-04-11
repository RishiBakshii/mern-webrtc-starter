import { type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/auth.context'
import { CameraIcon, MicIcon } from './CallControlIcons'
import { RoomCallSessionDebugPanel } from './RoomCallSessionDebugPanel'
import { RoomCallSessionFooter } from './RoomCallSessionFooter'
import type { RoomChatMessage } from '../../hooks/useRoomChat'

type Offset = { x: number; y: number }

type RemoteUser = { userId: string; username: string; email: string }

export type RoomCallSessionProps = {
  roomId: string | undefined
  isRemoteMicEnabled: boolean
  isRemoteCameraEnabled: boolean
  remoteAudioStream: MediaStream | null
  remoteVideoStream: MediaStream | null
  remoteScreenShareStream: MediaStream | null
  remoteScreenShareOffset: Offset
  handleRemoteScreenSharePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  remoteUser: RemoteUser | null
  remoteStream: MediaStream | null
  remoteSocketId: string | null
  hasLiveRemoteVideo: boolean
  myStream: MediaStream | null
  isMicOn: boolean
  isCameraOn: boolean
  handleMicToggle: () => void
  handleCameraToggle: () => void
  selfViewOffset: Offset
  handleSelfViewPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  isScreenSharing: boolean
  onScreenShareClick: () => void
  messages: RoomChatMessage[]
  chatInput: string
  setChatInput: (value: string) => void
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function RoomCallSession({
  roomId,
  isRemoteMicEnabled,
  isRemoteCameraEnabled,
  remoteAudioStream,
  remoteVideoStream,
  remoteScreenShareStream,
  remoteScreenShareOffset,
  handleRemoteScreenSharePointerDown,
  remoteUser,
  remoteStream,
  remoteSocketId,
  hasLiveRemoteVideo,
  myStream,
  isMicOn,
  isCameraOn,
  handleMicToggle,
  handleCameraToggle,
  selfViewOffset,
  handleSelfViewPointerDown,
  isScreenSharing,
  onScreenShareClick,
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
}: RoomCallSessionProps) {
  const { user } = useAuth()

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full gap-4">
      <section className="flex min-w-0 flex-1 flex-col gap-4">
        <RoomCallSessionDebugPanel
          isRemoteMicEnabled={isRemoteMicEnabled}
          isRemoteCameraEnabled={isRemoteCameraEnabled}
          remoteAudioStream={remoteAudioStream}
          remoteVideoStream={remoteVideoStream}
          remoteScreenShareStream={remoteScreenShareStream}
        />

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
              {remoteUser || Boolean(remoteStream) || Boolean(remoteSocketId) ? (
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
                        remoteAudioStream
                          ?.getAudioTracks()
                          .some((track) => track.enabled && track.readyState === 'live')
                          ? 'text-slate-300'
                          : 'text-red-300'
                      }
                    >
                      <MicIcon
                        muted={
                          !remoteAudioStream
                            ?.getAudioTracks()
                            .some((track) => track.enabled && track.readyState === 'live')
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
              )}
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

          {remoteScreenShareStream ? (
            <div
              className="absolute left-4 top-4 z-10 w-[min(100%,22rem)] max-w-[90vw] cursor-move overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950/95 shadow-lg shadow-black/40"
              onPointerDown={handleRemoteScreenSharePointerDown}
              style={{ transform: `translate(${remoteScreenShareOffset.x}px, ${remoteScreenShareOffset.y}px)` }}
            >
              <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-md border border-cyan-500/30 bg-slate-950/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200/90">
                Their screen
              </div>
              <video
                autoPlay
                playsInline
                className="aspect-video max-h-[40vh] w-full bg-black object-contain"
                ref={(video) => {
                  if (video) video.srcObject = remoteScreenShareStream
                }}
              />
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
                <p className="text-sm font-medium text-slate-300">
                  {!isCameraOn && isMicOn ? 'You (audio only)' : 'You'}
                </p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded-full border border-slate-700 bg-slate-900/80 p-1">
              <span className={isMicOn ? 'text-slate-300' : 'text-red-300'}>
                <MicIcon muted={!isMicOn} />
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

        <RoomCallSessionFooter
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          handleMicToggle={handleMicToggle}
          handleCameraToggle={handleCameraToggle}
          isScreenSharing={isScreenSharing}
          onScreenShareClick={onScreenShareClick}
        />
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
  )
}
