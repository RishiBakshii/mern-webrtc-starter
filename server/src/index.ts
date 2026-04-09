import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import http from 'http'
import morgan from 'morgan'
import { Server } from 'socket.io'
import { connectDB } from './config/db.config'
import { authRouter } from './routes/auth.route'
import { roomRouter } from './routes/room.route'
import { setupSocketHandlers } from './socket'
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware'

// database connection
connectDB()

const app = express()
const PORT = 5000
const server = http.createServer(app)
const io = new Server(server, {cors: {origin: 'http://localhost:5173',credentials: true}})

// global
app.set('io',io)

app.use(cors({credentials:true,origin:"http://localhost:5173"}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('tiny'))

// route middlewares
app.use("/api/auth",authRouter)
app.use('/api/room', roomRouter)

// health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'Server is running',uptime:process.uptime() })
})

// socket auth middleware
io.use(socketAuthMiddleware)

// socket init
setupSocketHandlers(io)

server.listen(PORT, () => {
  console.log(`SERVER running on port ${PORT}\n MODE ${process.env.NODE_ENV}`)
})
