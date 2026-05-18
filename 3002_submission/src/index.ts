import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import { dbConnect } from "./config/db.config"
import submissionRouter from "./router/submission.router"
import {connectToQueue} from "./config/rabbitMQ.config"

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