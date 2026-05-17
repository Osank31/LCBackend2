import { NextFunction, Request, Response } from "express"
import * as MailService from "../serivces/mail.service"
import { MailDataSchema } from "../validations/mail.validation"
import { sendSuccess } from "../utils/Response"


export const sendMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = MailDataSchema.parse(req.body)
        const {email, from, subject, body} = validatedData as MailService.IMailData
        
        
        const mailSendService = await MailService.sendMail({email, from, body, subject})

        sendSuccess(res, mailSendService, "Mail sent successfully", 200)
    } catch (error) {
        next(error)
    }
}