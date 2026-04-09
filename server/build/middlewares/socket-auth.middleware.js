"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const cookie_1 = require("cookie");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const socketAuthMiddleware = async (socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error('Unauthorized: token cookie missing'));
        }
        const cookies = (0, cookie_1.parse)(cookieHeader);
        const token = cookies.token;
        if (!token) {
            return next(new Error('Unauthorized: token missing'));
        }
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await user_model_1.User.findById(payload.userId).select('username email');
        if (!user) {
            return next(new Error('Unauthorized: user does not exist'));
        }
        socket.user = {
            userId: payload.userId,
            username: user.username,
            email: user.email,
        };
        return next();
    }
    catch {
        return next(new Error('Unauthorized: invalid or expired token'));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
