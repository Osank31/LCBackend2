import { CookieOptions, NextFunction, Request, Response } from "express"
import { loginUserSchema, registerUserSchema } from "../validation/auth.validation"
import { sendSuccess } from "../utils/Response"
import * as AuthService from '../service/auth.service'
import { BadRequestError } from "../utils/errors/AppError"

export const sendEmail = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const validatedData = registerUserSchema.parse(req.body)
    
        const {name, email, password} = validatedData
    
        const newOtp = await AuthService.sendEmail({email})
    
        sendSuccess(res, null, "otp sent successfully")
    } catch (error) {
        next(error)
    }
}

export const signUp = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const validatedData = registerUserSchema.parse(req.body)
    
        const {name, email, password, otp} = validatedData
        
        if(!otp){
            throw new BadRequestError("Otp required")
        }
    
        const newUser = await AuthService.signUp({name, email, password, otp})
    
        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + 7*24*60*60),
            httpOnly: true
        }
    
        res.cookie("refreshToken", newUser.refreshToken, cookieOptions).status(201).json({
            success: true,
            message: "User sign up successful",
            data: {...newUser, refreshToken: null}
        })
    
    } catch (error) {
        next(error)    
    }
}

export const login = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const validatedData = loginUserSchema.parse(req.body)

        const {email, password} = validatedData

        const user = await AuthService.login({email, password})

        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + 7*24*60*60),
            httpOnly: true
        }

        res.cookie("refreshToken", user.refreshToken, cookieOptions).status(201).json({
            success: true,
            message: "User sign up successful",
            data: {...user, refreshToken: null}
        })
    } catch (error) {
        next(error)
    }
}

export const forgetPassword = async (req: Request, res: Response, next: NextFunction)=>{}

export const forgotPasswordVerifyOtp = async (req: Request, res: Response, next: NextFunction)=>{}

export const resetPassword = async (req: Request, res: Response, next: NextFunction)=>{}

export const refrshToken = async (req: Request, res: Response, next: NextFunction)=>{}

export const logout = async (req: Request, res: Response, next: NextFunction)=>{}