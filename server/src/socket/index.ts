import { Server } from 'socket.io'
import { SOCKET_EVENTS } from './events'
import { registerRoomSocketHandlers } from './room/room.socket'
import { registerWebRtcSocketHandlers } from './webrtc/webrtc.socket'

export const setupSocketHandlers = (io: Server) => {

  io.on('connection', (socket) => {

    console.log(`${socket.user.username} connected`)

    socket.on(SOCKET_EVENTS.PING, () => {
      socket.emit(SOCKET_EVENTS.PONG, { message: 'pong from server' })
    })

    registerRoomSocketHandlers(socket)
    registerWebRtcSocketHandlers(socket)

    // disconnect
    socket.on('disconnect', () => {
        console.log(`${socket.user.username} disconnected`)
    })

  })
}
