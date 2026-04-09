import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { ExtendedError, Socket } from 'socket.io'
import { User } from '../models/user.model'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie

    if (!cookieHeader) {
      return next(new Error('Unauthorized: token cookie missing'))
    }

    const cookies = parse(cookieHeader)
    const token = cookies.token

    if (!token) {
      return next(new Error('Unauthorized: token missing'))
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await User.findById(payload.userId).select('username email')

    if (!user) {
      return next(new Error('Unauthorized: user does not exist'))
    }

    socket.user = {
      userId: payload.userId,
      username: user.username,
      email: user.email,
    }

    return next()
  } catch {
    return next(new Error('Unauthorized: invalid or expired token'))
  }
}
