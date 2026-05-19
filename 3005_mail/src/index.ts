import express from "express"
import "dotenv/config"
import { APP_PORT } from "./constants/constants"
import { appErrorHandler, genericErrorHandler } from "./middleware/errorHandler"
import logger from "./config/logger.config"
import mailRouter from "./routes/mail.route"

const app = express()

app.use(express.json())

app.use(mailRouter)


app.use(appErrorHandler);
app.use(genericErrorHandler);



app.listen(APP_PORT || 3000, ()=>{
    logger.info(`Server running on port ${APP_PORT || 3000}`)
})