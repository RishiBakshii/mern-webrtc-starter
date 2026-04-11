import { CameraIcon, MicIcon } from './CallControlIcons'

export type RoomCallSessionFooterProps = {
  isMicOn: boolean
  isCameraOn: boolean
  handleMicToggle: () => void
  handleCameraToggle: () => void
  isScreenSharing: boolean
  onScreenShareClick: () => void
}

export function RoomCallSessionFooter({
  isMicOn,
  isCameraOn,
  handleMicToggle,
  handleCameraToggle,
  isScreenSharing,
  onScreenShareClick,
}: RoomCallSessionFooterProps) {
  return (
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
          onClick={onScreenShareClick}
          aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            isScreenSharing
              ? 'bg-amber-500/25 text-amber-200 hover:bg-amber-500/35'
              : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
          }`}
        >
          {isScreenSharing ? 'Stop sharing' : 'Share screen'}
        </button>

        <button
          type="button"
          className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/30"
        >
          Leave
        </button>
      </div>
    </footer>
  )
}
