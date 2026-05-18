import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import { dbConnect } from "./config/db.config"
import proxy from "express-http-proxy"

const app = express()

app.use(express.json())

const authProxy = proxy("http://localhost:3004")
const problemProxy = proxy("http://localhost:3001")
const submissionProxy = proxy("http://locahost:3002")

app.use("/api/v1/auth", authProxy)
app.use("/api/v1/problems", problemProxy)
app.use("/api/v1/submission", submissionProxy)


app.use(appErrorHandler);
app.use(genericErrorHandler);

dbConnect()


app.listen(APP_PORT || 3000, ()=>{
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})