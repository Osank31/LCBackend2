import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants.js"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler.js"
import logger from "./config/logger.config.js"
import { dbConnect } from "./config/db.config.js"
import submissionRouter from "./router/submission.router.js"
import {connectToQueue} from "./config/rabbitMQ.config.js"

const app = express()

app.use(express.json())

app.use("/", submissionRouter)


app.use(appErrorHandler);
app.use(genericErrorHandler);

connectToQueue()
dbConnect()

app.listen(APP_PORT || 3000, async ()=>{
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})