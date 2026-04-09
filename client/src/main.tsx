import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/auth.context'
import { RoomProvider } from './context/room.context'
import { SocketProvider } from './context/socket.context'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <SocketProvider>
      <RoomProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#e2e8f0',
                border: '1px solid #334155',
              },
            }}
          />
        </BrowserRouter>
      </RoomProvider>
    </SocketProvider>
  </AuthProvider>
)
