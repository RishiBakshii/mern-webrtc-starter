import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/auth.context'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { RoomPage } from './pages/RoomPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'

function App() {
  const { isAuthenticated, checkAuth } = useAuth()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const runCheck = async () => {
      try {
        await checkAuth()
      } finally {
        setIsCheckingAuth(false)
      }
    }

    void runCheck()
  }, [checkAuth])

  if (isCheckingAuth) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-slate-950 px-6"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Checking authentication</span>
        <div className="flex flex-col items-center gap-7">
          <div className="relative grid place-items-center">
            <div
              className="absolute h-16 w-16 rounded-full bg-indigo-500/[0.07] blur-2xl"
              aria-hidden
            />
            <div
              className="relative h-10 w-10 rounded-full border-[1.5px] border-slate-800/90 border-t-indigo-400 motion-safe:animate-spin [animation-duration:0.85s] [animation-timing-function:cubic-bezier(0.65,0.05,0.36,1)]"
              aria-hidden
            />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
            Checking authentication
          </p>
        </div>
      </main>
    )
  }

  return (
    <Routes>
      {isAuthenticated ? (
        <>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </>
      )}
    </Routes>
  )
}

export default App
