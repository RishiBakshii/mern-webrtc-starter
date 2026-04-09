type MicIconProps = { muted?: boolean }
type CameraIconProps = { off?: boolean }

export const MicIcon = ({ muted = false }: MicIconProps) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <path d="M12 19v3" />
    <path d="M8 22h8" />
    {muted ? <path d="M4 4l16 16" /> : null}
  </svg>
)

export const CameraIcon = ({ off = false }: CameraIconProps) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="7" width="13" height="10" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
    {off ? <path d="M4 4l16 16" /> : null}
  </svg>
)
