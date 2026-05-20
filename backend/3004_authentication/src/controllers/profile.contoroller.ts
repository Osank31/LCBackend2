import { NextFunction, Request, Response } from "express";
import * as ProfileService from "../service/profile.service"
import { sendSuccess } from "../utils/Response";
import { BadRequestError } from "../utils/errors/AppError";

export const getPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {mimeType}: {mimeType: string} = req.body
        if(!mimeType){
            throw new BadRequestError(mimeType)
        }
        const data = await ProfileService.getPresignedUrl({mimeType})

        sendSuccess(res, data, "Presigned url fetched")
    } catch (error) {
        next(error)
    }
}