import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { axiosi } from '../config/axios.config'
import { readMessage } from '../lib/utils'

interface AuthUser {
  id: string
  username: string
  email: string
}

interface AuthResponse {
  message: string
  user: AuthUser
}

interface RegisterPayload {
  username: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  register: (payload: RegisterPayload) => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const checkAuth = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await axiosi.get<{ user: AuthUser }>('/auth/me')
      setUser(data.user)
    } catch (error) {
      setUser(null)
      setError(readMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await axiosi.post<AuthResponse>('/auth/register', payload)
        setUser(data.user)
      } catch (err) {
        const message = readMessage(err)
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await axiosi.post<AuthResponse>('/auth/login', payload)
      setUser(data.user)
    } catch (err) {
      const message = readMessage(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await axiosi.post('/auth/logout')
      setUser(null)
    } catch (err) {
      const message = readMessage(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      error,
      register,
      login,
      logout,
      checkAuth,
      clearError,
    }),
    [user, isLoading, error, register, login, logout, checkAuth, clearError],
  )

  return createElement(AuthContext.Provider, { value }, children)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
