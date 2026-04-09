"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomSocketHandlers = void 0;
const events_1 = require("../events");
const registerRoomSocketHandlers = (socket) => {
    socket.on(events_1.SOCKET_EVENTS.JOIN_ROOM, ({ roomId } = {}) => {
        console.log(`${socket.user.username} emitted join room event with roomId: ${roomId}`);
        if (!roomId) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, { message: 'roomId is required to join room' });
            return;
        }
        const existingSocketsInRoom = socket.nsp.adapter.rooms.get(roomId);
        const hasWaitingParticipant = Boolean(existingSocketsInRoom && existingSocketsInRoom.size > 0);
        socket.join(roomId);
        console.log(`${socket.user.username} joined room: ${roomId}`);
        socket.emit(events_1.SOCKET_EVENTS.ROOM_JOINED_CONFIRMATION, { roomId });
        if (hasWaitingParticipant) {
            socket.to(roomId).emit(events_1.SOCKET_EVENTS.OTHER_PERSON_JOINED, {
                roomId,
                joinedSocketId: socket.id,
                user: {
                    userId: socket.user.userId,
                    username: socket.user.username,
                    email: socket.user.email,
                },
            });
        }
    });
};
exports.registerRoomSocketHandlers = registerRoomSocketHandlers;
