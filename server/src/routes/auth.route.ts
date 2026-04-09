import { Router } from 'express'
import { login, logout, me, register } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/me', authMiddleware, me)
