import { Router } from 'express'
import { createRoom, getOtherUsersRooms, getRoomsByUser } from '../controllers/room.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const roomRouter = Router()

roomRouter.use(authMiddleware)

roomRouter.post('/', createRoom)
roomRouter.get('/', getRoomsByUser)
roomRouter.get('/others', getOtherUsersRooms)
