"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMessageSocketHandlers = void 0;
const events_1 = require("../events");
const registerMessageSocketHandlers = (socket, io) => {
    socket.on(events_1.SOCKET_EVENTS.SEND_MESSAGE, ({ message, roomId } = {}) => {
        const trimmed = typeof message === 'string' ? message.trim() : '';
        if (!roomId || !trimmed) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, {
                message: 'roomId and non-empty message are required',
            });
            return;
        }
        if (!socket.rooms.has(roomId)) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, {
                message: 'join the room before sending messages',
            });
            return;
        }
        const senderUserId = socket.user.userId;
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
        };
        io.to(roomId).emit(events_1.SOCKET_EVENTS.RECEIVE_MESSAGE, payload);
    });
};
exports.registerMessageSocketHandlers = registerMessageSocketHandlers;
