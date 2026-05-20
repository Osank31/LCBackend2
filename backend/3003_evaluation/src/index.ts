import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import {connectToQueue} from "./config/rabbitMQ.config"
import { startWorker } from "./worker/evaluation.worker"

const app = express()

app.use(express.json())




app.use(appErrorHandler);
app.use(genericErrorHandler);


async function startServer() {
    try {
        await connectToQueue()
        await startWorker()
        
        app.listen(APP_PORT || 3000, ()=>{
            logger.info(`Server running on port ${APP_PORT || 3000}`)
        })
        
    } catch (error) {
        logger.error(error)
    }
}

startServer()