import { type Server, type Socket } from 'socket.io'
import { SOCKET_EVENTS } from '../events'

interface SendMessagePayload {
  message?: string
  roomId?: string
}

export const registerMessageSocketHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.SEND_MESSAGE, ({ message, roomId }: SendMessagePayload = {}) => {
    const trimmed = typeof message === 'string' ? message.trim() : ''

    if (!roomId || !trimmed) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: 'roomId and non-empty message are required',
      })
      return
    }

    if (!socket.rooms.has(roomId)) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: 'join the room before sending messages',
      })
      return
    }

    const senderUserId = socket.user.userId

    const payload = {
      roomId,
      message: trimmed,
      senderUserId,
      sender: {
        userId: senderUserId,
        username: socket.user.username,
        email: socket.user.email,
      },
      sentAt: new Date().toISOString(),
    }

    io.to(roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, payload)
  })
}
