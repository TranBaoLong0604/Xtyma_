"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const app = (0, fastify_1.default)({
    logger: true,
});
app.get("/", async () => {
    return {
        message: "Xtyma_ API is running",
    };
});
const start = async () => {
    try {
        await app.listen({
            port: 3000,
            host: "127.0.0.1",
        });
        console.log("Xtyma_ API is running at http://127.0.0.1:3000");
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
start();
