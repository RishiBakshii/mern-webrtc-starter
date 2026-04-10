"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const db_config_1 = require("./config/db.config");
const auth_route_1 = require("./routes/auth.route");
const room_route_1 = require("./routes/room.route");
const socket_1 = require("./socket");
const socket_auth_middleware_1 = require("./middlewares/socket-auth.middleware");
// database connection
(0, db_config_1.connectDB)();
const app = (0, express_1.default)();
const PORT = 5000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: process.env.NODE_ENV === 'production' ? 'https://webrtc-project-1-uw8x.onrender.com' : 'http://localhost:5173', credentials: true } });
// global
app.set('io', io);
app.use((0, cors_1.default)({ credentials: true, origin: "http://localhost:5173" }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('tiny'));
// route middlewares
app.use("/api/auth", auth_route_1.authRouter);
app.use('/api/room', room_route_1.roomRouter);
// health check
app.get('/api/health', (_req, res) => {
    res.status(200).json({ message: 'Server is running', uptime: process.uptime() });
});
// socket auth middleware
io.use(socket_auth_middleware_1.socketAuthMiddleware);
// socket init
(0, socket_1.setupSocketHandlers)(io);
server.listen(PORT, () => {
    console.log(`SERVER running on port ${PORT}\n MODE ${process.env.NODE_ENV}`);
});
