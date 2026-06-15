import {NextFunction, Request, Response} from "express";
import * as ProfileService from "../service/profile.service"
import {sendSuccess} from "../utils/Response";
import {BadRequestError} from "../utils/errors/AppError";
import User from "../models/user.model";

export const getPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {mimeType}: { mimeType: string } = req.body
        if (!mimeType) {
            throw new BadRequestError(mimeType)
        }
        const data = await ProfileService.getPresignedUrl({mimeType})

        sendSuccess(res, data, "Presigned url fetched")
    } catch (error) {
        next(error)
    }
}

export interface UpdateUserRoleBody {
    userId: string;
    userRole: "Regular" | "Admin" | "Premium";
    roleExpiry: number | null;
}

export const updateUserRole = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {userId, userRole, roleExpiry} = req.body as UpdateUserRoleBody

        const data = await ProfileService.updateUserRole({userId, userRole, roleExpiry})

        sendSuccess(res, data, "User updated successfully");

    } catch (e) {
        next(e);
    }
};