export type RoomCallSessionDebugPanelProps = {
  isRemoteMicEnabled: boolean
  isRemoteCameraEnabled: boolean
  remoteAudioStream: MediaStream | null
  remoteVideoStream: MediaStream | null
  remoteScreenShareStream: MediaStream | null
}

export function RoomCallSessionDebugPanel({
  isRemoteMicEnabled,
  isRemoteCameraEnabled,
  remoteAudioStream,
  remoteVideoStream,
  remoteScreenShareStream,
}: RoomCallSessionDebugPanelProps) {
  return (
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
      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-200">
        remoteScreen: {remoteScreenShareStream ? 'available' : 'none'}
      </span>
    </div>
  )
}
