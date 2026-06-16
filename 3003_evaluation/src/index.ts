import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants.js"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler.js"
import logger from "./config/logger.config.js"
import {connectToQueue} from "./config/rabbitMQ.config.js"
import { startWorker } from "./worker/evaluation.worker.js"

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