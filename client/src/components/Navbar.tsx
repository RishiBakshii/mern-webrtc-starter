interface NavbarProps {
  username?: string
  onLogout: () => Promise<void> | void
  isLoggingOut?: boolean
}

export const Navbar = ({ username, onLogout, isLoggingOut = false }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-10 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-xl shadow-black/20 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">Workspace</p>
          <h1 className="text-lg font-semibold text-slate-100">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {username && (
            <p className="hidden rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 sm:block">
              Signed in as <span className="font-medium text-slate-100">{username}</span>
            </p>
          )}

          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  )
}
