import bcrypt from 'bcrypt'
import { CookieOptions, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model'
import { AuthenticatedRequest } from '../middlewares/auth.middleware'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'
const JWT_EXPIRES_IN = '7d'

const cookieOptions:CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const signToken = (userId: string) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body as {
      username?: string
      email?: string
      password?: string
    }

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' })
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    const token = signToken(String(user._id))
    res.cookie('token', token, cookieOptions)

    return res.status(201).json({
      message: 'Registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Failed to register user' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(String(user._id))
    res.cookie('token', token, cookieOptions)

    return res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    })
  } catch {
    return res.status(500).json({ message: 'Failed to login' })
  }
}

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return res.status(200).json({ message: 'Logged out successfully' })
}

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get user' })
  }
}
