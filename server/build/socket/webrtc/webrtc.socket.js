"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWebRtcSocketHandlers = void 0;
const events_1 = require("../events");
const registerWebRtcSocketHandlers = (socket) => {
    socket.on(events_1.SOCKET_EVENTS.WEBRTC_OFFER, ({ roomId, toSocketId, offer } = {}) => {
        if (!roomId || !toSocketId || !offer) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, {
                message: 'roomId, toSocketId and offer are required',
            });
            return;
        }
        const payload = {
            roomId,
            fromSocketId: socket.id,
            fromUser: {
                userId: socket.user.userId,
                username: socket.user.username,
                email: socket.user.email,
            },
            offer,
        };
        console.log(`${socket.user.username} sent WEBRTC_OFFER to socket ${toSocketId} for room ${roomId}`);
        socket.to(toSocketId).emit(events_1.SOCKET_EVENTS.WEBRTC_OFFER, payload);
    });
    socket.on(events_1.SOCKET_EVENTS.WEBRTC_ANSWER, ({ roomId, toSocketId, answer } = {}) => {
        if (!roomId || !toSocketId || !answer) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, {
                message: 'roomId, toSocketId and answer are required',
            });
            return;
        }
        const payload = {
            roomId,
            fromSocketId: socket.id,
            fromUser: {
                userId: socket.user.userId,
                username: socket.user.username,
                email: socket.user.email,
            },
            answer,
        };
        console.log(`${socket.user.username} sent WEBRTC_ANSWER to socket ${toSocketId} for room ${roomId}`);
        socket.to(toSocketId).emit(events_1.SOCKET_EVENTS.WEBRTC_ANSWER, payload);
    });
    socket.on(events_1.SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, ({ roomId, toSocketId, candidate } = {}) => {
        if (!roomId || !toSocketId || !candidate) {
            socket.emit(events_1.SOCKET_EVENTS.ROOM_ERROR, {
                message: 'roomId, toSocketId and candidate are required',
            });
            return;
        }
        const payload = {
            roomId,
            fromSocketId: socket.id,
            fromUser: {
                userId: socket.user.userId,
                username: socket.user.username,
                email: socket.user.email,
            },
            candidate,
        };
        console.log(`${socket.user.username} sent WEBRTC_ICE_CANDIDATE to socket ${toSocketId} for room ${roomId}`);
        socket.to(toSocketId).emit(events_1.SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, payload);
    });
};
exports.registerWebRtcSocketHandlers = registerWebRtcSocketHandlers;
