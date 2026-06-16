import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants.js"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler.js"
import logger from "./config/logger.config.js"
import { dbConnect } from "./config/db.config.js"
import problemRouter from "./routers/problem.router.js"

const app = express()

app.use(express.json())


app.use("/", problemRouter)

app.use(appErrorHandler);
app.use(genericErrorHandler);

dbConnect()


app.listen(APP_PORT || 3000, ()=>{
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})