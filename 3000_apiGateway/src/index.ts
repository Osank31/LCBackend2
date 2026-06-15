import express, {Response, NextFunction} from "express"
import "dotenv/config"
import {
    APP_PORT,
    AUTH_SERVICE_URL,
    PAYMENT_SERVICE_URL,
    PROBLEM_SERVICE_URL,
    SUBMISSION_SERVICE_URL
} from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import proxy from "express-http-proxy"
import { loginValidation } from "./middleware/auth.middleware"
import { sendError } from "./utils/Response"
import cookieParser from 'cookie-parser'
import cors from 'cors'

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

const paymentProxy = proxy(PAYMENT_SERVICE_URL, {
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
        logger.error("submission service error", err)

        if (!res.headersSent) {
            if (err.code  === "ECONNREFUSED" ) {
                return sendError(res, "Payment service unavailable", 503)
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
app.post("/api/v1/payment/order", loginValidation, paymentProxy)
app.post("/api/v1/payment/webhooks/razorpay/paymentCapture", paymentProxy)


app.use(appErrorHandler);
app.use(genericErrorHandler);

app.listen(Number(APP_PORT) || 3000, () => {
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})