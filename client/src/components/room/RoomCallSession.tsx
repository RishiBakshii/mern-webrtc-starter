import { useEffect, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/auth.context'
import type { RoomChatMessage } from '../../hooks/useRoomChat'
import { ChatSidebarContent } from './ChatSidebarContent'
import { CameraIcon, MicIcon } from './CallControlIcons'
import { RoomCallSessionFooter } from './RoomCallSessionFooter'

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
  remoteScreenPipWidth: number
  remoteScreenPipHeight: number
  handleRemoteScreenPipResizePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
  selfPipWidth: number
  selfPipHeight: number
  handleSelfPipResizePointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
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
  onLeaveClick: () => void
  messages: RoomChatMessage[]
  chatInput: string
  setChatInput: (value: string) => void
  handleChatSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function RoomCallSession({
  roomId,
  isRemoteMicEnabled: _isRemoteMicEnabled,
  isRemoteCameraEnabled: _isRemoteCameraEnabled,
  remoteAudioStream,
  remoteVideoStream,
  remoteScreenShareStream,
  remoteScreenShareOffset,
  handleRemoteScreenSharePointerDown,
  remoteScreenPipWidth,
  remoteScreenPipHeight,
  handleRemoteScreenPipResizePointerDown,
  selfPipWidth,
  selfPipHeight,
  handleSelfPipResizePointerDown,
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
  onLeaveClick,
  messages,
  chatInput,
  setChatInput,
  handleChatSubmit,
}: RoomCallSessionProps) {
  const { user } = useAuth()
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  useEffect(() => {
    if (!isMobileChatOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileChatOpen])

  useEffect(() => {
    if (!isMobileChatOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileChatOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileChatOpen])

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full gap-4">
      <section className="flex min-w-0 flex-1 flex-col gap-4">
        {/* <RoomCallSessionDebugPanel
          isRemoteMicEnabled={isRemoteMicEnabled}
          isRemoteCameraEnabled={isRemoteCameraEnabled}
          remoteAudioStream={remoteAudioStream}
          remoteVideoStream={remoteVideoStream}
          remoteScreenShareStream={remoteScreenShareStream}
        /> */}

        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Room</p>
            <h1 className="text-lg font-semibold">{roomId}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMobileChatOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800 lg:hidden"
              aria-expanded={isMobileChatOpen}
              aria-controls="mobile-chat-drawer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat
            </button>
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Back to dashboard
            </Link>
          </div>
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
              className="absolute left-4 top-4 z-10 max-w-[min(100%,90vw)] cursor-move overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950/95 shadow-lg shadow-black/40"
              onPointerDown={handleRemoteScreenSharePointerDown}
              style={{
                width: remoteScreenPipWidth,
                height: remoteScreenPipHeight,
                transform: `translate(${remoteScreenShareOffset.x}px, ${remoteScreenShareOffset.y}px)`,
              }}
            >
              <div className="pointer-events-none absolute left-2 top-2 z-10 rounded-md border border-cyan-500/30 bg-slate-950/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200/90">
                Their screen
              </div>
              <video
                autoPlay
                playsInline
                className="h-full w-full bg-black object-contain"
                ref={(video) => {
                  if (video) video.srcObject = remoteScreenShareStream
                }}
              />
              <div
                className="absolute bottom-0 right-0 z-20 h-6 w-6 cursor-nwse-resize touch-none rounded-tl-md border-l border-t border-cyan-500/40 bg-slate-950/90"
                onPointerDown={handleRemoteScreenPipResizePointerDown}
                aria-label="Resize their screen preview"
                role="separator"
              />
            </div>
          ) : null}

          <div
            className="absolute bottom-4 right-4 max-w-[min(100%,90vw)] cursor-move overflow-hidden rounded-xl border border-slate-700 bg-slate-950/90 shadow-lg shadow-black/30"
            onPointerDown={handleSelfViewPointerDown}
            style={{
              width: selfPipWidth,
              height: selfPipHeight,
              transform: `translate(${selfViewOffset.x}px, ${selfViewOffset.y}px)`,
            }}
          >
            <div
              className="absolute left-0 top-0 z-20 h-6 w-6 cursor-nesw-resize touch-none rounded-br-md border-b border-r border-slate-600/80 bg-slate-950/90"
              onPointerDown={handleSelfPipResizePointerDown}
              aria-label="Resize your camera preview"
              role="separator"
            />
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
          onLeaveClick={onLeaveClick}
        />
      </section>

      <aside className="hidden w-[330px] shrink-0 flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 lg:flex">
        <ChatSidebarContent
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSubmit={handleChatSubmit}
          userId={user?.id}
          variant="docked"
        />
      </aside>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out lg:hidden ${
          isMobileChatOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isMobileChatOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          aria-label="Close chat"
          onClick={() => setIsMobileChatOpen(false)}
        />
      </div>

      <aside
        id="mobile-chat-drawer"
        className={`fixed inset-y-0 right-0 z-50 flex min-h-0 w-[min(100vw,22rem)] max-w-full flex-col border-l border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/50 transition-transform duration-300 ease-out lg:hidden ${
          isMobileChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isMobileChatOpen}
      >
        <ChatSidebarContent
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSubmit={handleChatSubmit}
          userId={user?.id}
          variant="drawer"
          onClose={() => setIsMobileChatOpen(false)}
        />
      </aside>
    </div>
  )
}
