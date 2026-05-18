import express, {Response, NextFunction} from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import { dbConnect } from "./config/db.config"
import proxy from "express-http-proxy"
import { loginValidation } from "./middleware/auth.middleware"

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

    proxyErrorHandler(err: any, res: Response, next: NextFunction) {
        console.log("proxy error", err.message);

        res.status(500).json({
            success: false,
            message: "Auth service unavailable"
        });
    }
})
const problemProxy = proxy("http://localhost:3001")
const submissionProxy = proxy("http://locahost:3002")

app.use("/api/v1/auth", authProxy)
app.use("/api/v1/problems",loginValidation, problemProxy)
app.use("/api/v1/submission",loginValidation, submissionProxy)


app.use(appErrorHandler);
app.use(genericErrorHandler);

dbConnect()


app.listen(APP_PORT || 3000, () => {
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})