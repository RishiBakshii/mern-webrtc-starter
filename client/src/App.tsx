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
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Checking authentication...
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
