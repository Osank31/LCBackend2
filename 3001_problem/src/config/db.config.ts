import mongoose from "mongoose";
import logger from "./logger.config";
import { MONGODB_URL } from "../constants/constants";

export const dbConnect = async() => {
    try{
        await mongoose.connect(MONGODB_URL as string)
        logger.info(`Connected to MongoDbDatabase successfully`);
    }
    catch(error: any){
        if (error instanceof Error){

            logger.error("Problem Service db connection failed", error);
            process.exit(1)
        }
        else{
            logger.error("Problem Service db connection failed unkown", error.message);
        }
    }

}