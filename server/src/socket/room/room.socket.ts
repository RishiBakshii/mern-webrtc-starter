import { Socket } from 'socket.io'
import { SOCKET_EVENTS } from '../events'

interface JoinRoomPayload {
  roomId?: string
}

export const registerRoomSocketHandlers = (socket: Socket) => {


  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId }: JoinRoomPayload = {}) => {

    console.log(`${socket.user.username} emitted join room event with roomId: ${roomId}`)

    if (!roomId) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, { message: 'roomId is required to join room' })
      return
    }

    const existingSocketsInRoom = socket.nsp.adapter.rooms.get(roomId)
    const hasWaitingParticipant = Boolean(existingSocketsInRoom && existingSocketsInRoom.size > 0)

    socket.join(roomId)
    console.log(`${socket.user.username} joined room: ${roomId}`)
    socket.emit(SOCKET_EVENTS.ROOM_JOINED_CONFIRMATION, { roomId })

    if (hasWaitingParticipant) {
      socket.to(roomId).emit(SOCKET_EVENTS.OTHER_PERSON_JOINED, {
        roomId,
        joinedSocketId: socket.id,
        user: {
          userId: socket.user.userId,
          username: socket.user.username,
          email: socket.user.email,
        },
      })
    }
  })

}
