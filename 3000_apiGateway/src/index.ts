import express, {Response, NextFunction} from "express"
import "dotenv/config"
import { APP_PORT, AUTH_SERVICE_URL, PROBLEM_SERVICE_URL, SUBMISSION_SERVICE_URL } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import proxy from "express-http-proxy"
import { loginValidation } from "./middleware/auth.middleware"
import { sendError } from "./utils/Response"
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { createServer } from "http"
import { Server } from "socket.io"
import amqplib from "amqplib"
import path from "path"
import { fileURLToPath } from "url"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())

const authProxy = proxy(AUTH_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/auth", "")
    },

    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["x-user-id"] = JSON.stringify(srcReq.user?.userId)
        }
        return proxyReqOpts
    },
    proxyErrorHandler(err, res: Response, next: NextFunction) {
        logger.error("Auth service error", err.message)

        if (!res.headersSent) {
            if (err.code  === "ECONNREFUSED" ) {
                return sendError(res, "Auth service unavailable", 503)
            }

            return sendError(res, "Internal Proxy Error", 500)
        }
        next(err)
    }
})
const problemProxy = proxy(PROBLEM_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/problems", "")
    },
    
    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["x-user-id"] = JSON.stringify(srcReq.user?.userId)
        }
        return proxyReqOpts
    },
    proxyErrorHandler(err, res: Response, next: NextFunction) {
        logger.error("Problem service error", err.message)

        if (!res.headersSent) {
            if (err.code  === "ECONNREFUSED" ) {
                return sendError(res, "Problem service unavailable", 503)
            }

            return sendError(res, "Internal Proxy Error", 500)
        }
        next(err)
    }
})
const submissionProxy = proxy(SUBMISSION_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/submission", "")
    },
    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["x-user-id"] = JSON.stringify(srcReq.user?.userId)
        }
        return proxyReqOpts
    },
    proxyErrorHandler(err, res: Response, next: NextFunction) {
        logger.error("submission service error", err.message)

        if (!res.headersSent) {
            if (err.code  === "ECONNREFUSED" ) {
                return sendError(res, "submission service unavailable", 503)
            }

            return sendError(res, "Internal Proxy Error", 500)
        }
        next(err)
    }
})

const paymentProxy = proxy(SUBMISSION_SERVICE_URL, {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/payment", "")
    },
    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["x-user-id"] = JSON.stringify(srcReq.user?.userId)
        }
        return proxyReqOpts
    },
    proxyErrorHandler(err, res: Response, next: NextFunction) {
        logger.error("submission service error", err.message)

        if (!res.headersSent) {
            if (err.code  === "ECONNREFUSED" ) {
                return sendError(res, "submission service unavailable", 503)
            }

            return sendError(res, "Internal Proxy Error", 500)
        }
        next(err)
    }
})


app.get("/api/v1/problems", problemProxy)
app.get("/api/v1/problems/:id", problemProxy)
app.post("/api/v1/problems", loginValidation, problemProxy)
app.put("/api/v1/problems/:id", loginValidation, problemProxy)
app.delete("/api/v1/problems/:id", loginValidation, problemProxy)

app.use("/api/v1/auth", authProxy)

app.use("/api/v1/submission", loginValidation, submissionProxy)
app.use("/api/v1/payment", loginValidation, paymentProxy)


app.use(appErrorHandler);
app.use(genericErrorHandler);

// Create HTTP server wrapping Express
const server = createServer(app)

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const userSockets = new Map<string, Set<string>>()

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string
    if (userId) {
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set())
        }
        userSockets.get(userId)!.add(socket.id)
        logger.info(`WebSocket: User ${userId} connected on socket ${socket.id}`)
    }

    socket.on("disconnect", () => {
        if (userId) {
            const sockets = userSockets.get(userId)
            if (sockets) {
                sockets.delete(socket.id)
                if (sockets.size === 0) {
                    userSockets.delete(userId)
                }
            }
            logger.info(`WebSocket: User ${userId} disconnected from socket ${socket.id}`)
        }
    })
})

// Connect to RabbitMQ and consume completed submissions
async function connectToRabbitMQ() {
    try {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL || "amqp://localhost")
        const channel = await connection.createChannel()
        const queueName = "submission.completed"

        await channel.assertQueue(queueName)
        logger.info(`Connected to RabbitMQ and asserted queue: ${queueName}`)

        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                try {
                    const messageContent = JSON.parse(msg.content.toString())
                    logger.info(`Received submission.completed event: ${JSON.stringify(messageContent)}`)

                    const { userId, submissionId, problemId, status, results, failedTestCase } = messageContent

                    if (userId) {
                        const sockets = userSockets.get(userId)
                        if (sockets && sockets.size > 0) {
                            for (const socketId of sockets) {
                                io.to(socketId).emit("submissionCompleted", {
                                    submissionId,
                                    problemId,
                                    status,
                                    results,
                                    failedTestCase
                                })
                            }
                            logger.info(`Dispatched submissionCompleted socket event to user ${userId}`)
                        } else {
                            logger.warn(`No active WebSocket connection for user ${userId}`)
                        }
                    } else {
                        logger.warn("Received submission.completed event with no userId")
                    }

                    channel.ack(msg)
                } catch (consumeError: any) {
                    logger.error("Error processing submission.completed message", consumeError)
                    channel.nack(msg, false, false)
                }
            }
        })
    } catch (error: any) {
        logger.error("Failed to connect to RabbitMQ in API Gateway", error)
        setTimeout(connectToRabbitMQ, 5000)
    }
}

server.listen(APP_PORT || 3000, () => {
    logger.info(`Server running on port ${APP_PORT || 3000}`)
    connectToRabbitMQ()
})