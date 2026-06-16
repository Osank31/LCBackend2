import mongoose from "mongoose";
import logger from "./logger.config.js";
import { MONGODB_URL } from "../constants/constants.js";

export const dbConnect = async() => {
    try{
        mongoose.connect(MONGODB_URL as string)
        logger.info(`Connected to MongoDbDatabase successfully`);
    
    }
    catch(error: any){
        if (error instanceof Error){

            logger.error("Auth Service db connectuion failed", error.message);
            process.exit(1)
        }
        else{
            logger.error("Auth Service db connectuion failed unkown", error.message);
        }
    }

}