"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const developmentConfig = {
    clientUrl: ['http://localhost:5173']
};
const productionConfig = {
    clientUrl: ['https://webrtc-frontend-jqjv.onrender.com']
};
const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;
exports.default = config;
