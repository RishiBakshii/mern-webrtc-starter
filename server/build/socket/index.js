"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const events_1 = require("./events");
const room_socket_1 = require("./room/room.socket");
const webrtc_socket_1 = require("./webrtc/webrtc.socket");
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`${socket.user.username} connected`);
        socket.on(events_1.SOCKET_EVENTS.PING, () => {
            socket.emit(events_1.SOCKET_EVENTS.PONG, { message: 'pong from server' });
        });
        (0, room_socket_1.registerRoomSocketHandlers)(socket);
        (0, webrtc_socket_1.registerWebRtcSocketHandlers)(socket);
        // disconnect
        socket.on('disconnect', () => {
            console.log(`${socket.user.username} disconnected`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
