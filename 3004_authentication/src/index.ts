import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import { dbConnect } from "./config/db.config"
import cookieParser from "cookie-parser"
import userRouter from "./router/user.router"
import { redisConnect } from "./config/redis.config"

const app = express()

app.use(express.json())
app.use(cookieParser())


app.use("/", userRouter)


app.use(appErrorHandler);
app.use(genericErrorHandler);

dbConnect()
redisConnect()


app.listen(APP_PORT || 3000, ()=>{
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})