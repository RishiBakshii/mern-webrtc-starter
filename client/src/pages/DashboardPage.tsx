import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.context'
import { useRoom } from '../context/room.context'
import { useSocket } from '../context/socket.context'
import { Navbar } from '../components/Navbar'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, logout, error, clearError } = useAuth()
  const {
    rooms,
    otherUsersRooms,
    setActiveRoomId,
    isLoading: isRoomLoading,
    error: roomError,
    createRoom,
    getRoomsByUser,
    getOtherUsersRooms,
    clearError: clearRoomError,
  } = useRoom()
  const { isConnected, connectSocket, disconnectSocket } = useSocket()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [roomname, setRoomname] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      void getRoomsByUser()
      void getOtherUsersRooms()
    }
  }, [isAuthenticated, getRoomsByUser, getOtherUsersRooms])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    clearError()
    try {
      await logout()
      navigate('/auth/login')
    } catch {
      // Error is handled in auth context.
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreatingRoom(true)
    clearRoomError()

    try {
      await createRoom({ roomId, roomname })
      setRoomId('')
      setRoomname('')
    } catch {
      // Error is handled by room context.
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const handleJoinRoom = (clickedRoomId: string) => {
    setActiveRoomId(clickedRoomId)
    navigate(`/room/${clickedRoomId}`)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {isAuthenticated && (
          <Navbar
            username={user?.username}
            onLogout={() => void handleLogout()}
            isLoggingOut={isLoggingOut}
          />
        )}

        {isAuthenticated && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium text-slate-100">Socket connection</h2>
                <p className="text-sm text-slate-400">
                  Status:{' '}
                  <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={connectSocket}
                  disabled={isConnected}
                  className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Connect
                </button>
                <button
                  type="button"
                  onClick={disconnectSocket}
                  disabled={!isConnected}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </section>
        )}

        {isAuthenticated && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-100">Other people rooms</h2>
              <button
                type="button"
                onClick={() => void getOtherUsersRooms()}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            {isRoomLoading ? (
              <p className="text-sm text-slate-400">Loading rooms...</p>
            ) : otherUsersRooms.length === 0 ? (
              <p className="text-sm text-slate-400">No other rooms available.</p>
            ) : (
              <ul className="space-y-2">
                {otherUsersRooms.map((room) => (
                  <li
                    key={room._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">{room.roomname}</p>
                      <p className="text-xs text-slate-400">Room ID: {room.roomId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoinRoom(room.roomId)}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400"
                    >
                      Join
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {isAuthenticated && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <h2 className="mb-4 text-lg font-medium text-slate-100">Create room</h2>
            <form className="space-y-4" onSubmit={handleCreateRoom}>
              <div className="space-y-1.5">
                <label htmlFor="roomId" className="text-sm font-medium text-slate-300">
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                  placeholder="room-123"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="roomname" className="text-sm font-medium text-slate-300">
                  Room name
                </label>
                <input
                  id="roomname"
                  type="text"
                  value={roomname}
                  onChange={(event) => setRoomname(event.target.value)}
                  placeholder="Team Sync"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isCreatingRoom || isRoomLoading}
                className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingRoom ? 'Creating room...' : 'Create room'}
              </button>
            </form>
          </section>
        )}

        {isAuthenticated && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-100">Your rooms</h2>
              <button
                type="button"
                onClick={() => void getRoomsByUser()}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>

            {isRoomLoading ? (
              <p className="text-sm text-slate-400">Loading rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-slate-400">No rooms created yet.</p>
            ) : (
              <ul className="space-y-2">
                {rooms.map((room) => (
                  <li
                    key={room._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">{room.roomname}</p>
                      <p className="text-xs text-slate-400">Room ID: {room.roomId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJoinRoom(room.roomId)}
                      className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400"
                    >
                      Join
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {roomError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {roomError}
          </p>
        )}
      </div>
    </main>
  )
}
