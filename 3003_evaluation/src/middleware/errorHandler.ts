import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors/AppError.js";
import logger from "../config/logger.config.js";

export const appErrorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {

    logger.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: err.issues.map(issue => ({
                path: issue.path,
                message: issue.message
            }))
        });
    }
    else{
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }
}

export const genericErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
}