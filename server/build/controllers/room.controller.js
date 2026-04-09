"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOtherUsersRooms = exports.getRoomsByUser = exports.createRoom = void 0;
const room_model_1 = require("../models/room.model");
const createRoom = async (req, res) => {
    try {
        const { roomId, roomname } = req.body;
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roomId || !roomname) {
            return res.status(400).json({ message: 'roomId and roomname are required' });
        }
        const existingRoom = await room_model_1.Room.findOne({ roomId });
        if (existingRoom) {
            return res.status(409).json({ message: 'Room already exists' });
        }
        const room = await room_model_1.Room.create({
            userId: req.userId,
            roomId,
            roomname,
        });
        return res.status(201).json({
            message: 'Room created successfully',
            room,
        });
    }
    catch {
        return res.status(500).json({ message: 'Failed to create room' });
    }
};
exports.createRoom = createRoom;
const getRoomsByUser = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const rooms = await room_model_1.Room.find({ userId: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: 'Rooms fetched successfully',
            rooms,
        });
    }
    catch {
        return res.status(500).json({ message: 'Failed to fetch rooms' });
    }
};
exports.getRoomsByUser = getRoomsByUser;
const getOtherUsersRooms = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const rooms = await room_model_1.Room.find({ userId: { $ne: req.userId } }).sort({ createdAt: -1 });
        return res.status(200).json({
            message: 'Other users rooms fetched successfully',
            rooms,
        });
    }
    catch {
        return res.status(500).json({ message: 'Failed to fetch other users rooms' });
    }
};
exports.getOtherUsersRooms = getOtherUsersRooms;
