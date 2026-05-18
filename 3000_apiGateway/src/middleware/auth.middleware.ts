import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { ACCESS_TOKEN_JWT_KEY } from "../constants/constants";
export const loginValidation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token=(req.headers.authorization?.startsWith("Bearer ") ? 
            (req.headers.authorization?.split(" ")[1]) : (req.cookies?.accessToken || req.body))
        
        const verifyToken = jwt.verify(token, ACCESS_TOKEN_JWT_KEY)

        req.user = verifyToken

        next()
    } catch (error) {
        next(error)
    }
}