import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import toast from 'react-hot-toast'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from './auth.context'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  connectSocket: () => void
  disconnectSocket: () => void
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
      })

      socketRef.current.on('connect', () => {
        setIsConnected(true)
        toast.success('Socket connected')
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
        toast.error('Socket disconnected')
      })
    }

    socketRef.current.connect()
  }, [])

  const disconnectSocket = useCallback(() => {
    if (!socketRef.current) return
    socketRef.current.disconnect()
    setIsConnected(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }

    return () => {
      if (!socketRef.current) return
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [isAuthenticated, connectSocket, disconnectSocket])

  const value = useMemo<SocketContextValue>(
    () => ({
      socket: socketRef.current,
      isConnected,
      connectSocket,
      disconnectSocket,
    }),
    [isConnected, connectSocket, disconnectSocket],
  )

  return createElement(SocketContext.Provider, { value }, children)
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used inside SocketProvider')
  }
  return context
}
