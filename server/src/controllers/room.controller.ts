import { Response } from 'express'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'
import { Room } from '../models/room.model'

export const createRoom = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roomId, roomname } = req.body as {
      roomId?: string
      roomname?: string
    }

    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!roomId || !roomname) {
      return res.status(400).json({ message: 'roomId and roomname are required' })
    }

    const existingRoom = await Room.findOne({ roomId })
    if (existingRoom) {
      return res.status(409).json({ message: 'Room already exists' })
    }

    const room = await Room.create({
      userId: req.userId,
      roomId,
      roomname,
    })

    return res.status(201).json({
      message: 'Room created successfully',
      room,
    })
  } catch {
    return res.status(500).json({ message: 'Failed to create room' })
  }
}

export const getRoomsByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const rooms = await Room.find({ userId: req.userId }).sort({ createdAt: -1 })

    return res.status(200).json({
      message: 'Rooms fetched successfully',
      rooms,
    })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch rooms' })
  }
}

export const getOtherUsersRooms = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const rooms = await Room.find({ userId: { $ne: req.userId } }).sort({ createdAt: -1 })

    return res.status(200).json({
      message: 'Other users rooms fetched successfully',
      rooms,
    })
  } catch {
    return res.status(500).json({ message: 'Failed to fetch other users rooms' })
  }
}
