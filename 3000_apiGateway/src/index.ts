import express, {Response, NextFunction} from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import proxy from "express-http-proxy"
import { loginValidation } from "./middleware/auth.middleware"
import { sendError } from "./utils/Response"

const app = express()

app.use(express.json())

const authProxy = proxy("http://localhost:3004", {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/auth", "")
    },

    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["user"] = JSON.stringify(srcReq.user)
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
const problemProxy = proxy("http://localhost:3001", {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/problems", "")
    },
    
    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["user"] = JSON.stringify(srcReq.user)
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

const submissionProxy = proxy("http://localhost:3002", {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace("/api/v1/submission", "")
    },
    proxyReqOptDecorator(proxyReqOpts, srcReq: any) {
        if (srcReq.user) {
            proxyReqOpts.headers["user"] = JSON.stringify(srcReq.user)
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

app.use("/api/v1/auth", authProxy)
app.use("/api/v1/problems",loginValidation, problemProxy)
app.use("/api/v1/submission", submissionProxy)


app.use(appErrorHandler);
app.use(genericErrorHandler);



app.listen(APP_PORT || 3000, () => {
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})