import axios from "axios"
import { getRedisClient } from "../config/redis.config"
import User from "../models/user.model"
import { mailTemplate } from "../templates/mail.template"
import { ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../utils/errors/AppError"
import otpGenerator from "otp-generator"
import { ACCESS_TOKEN_JWT_KEY, MAIL_SERVICE_URL, REFRESH_TOKEN_JWT_KEY } from "../constants/constants"
import { LoginUserInput, registerUserSchema, type RegisterUserInput } from "../validation/auth.validation"
import jwt from "jsonwebtoken"

export const sendEmail = async (data: { email: string }) => {
    const { email } = data

    const isPresent = await User.findOne({ email })

    if (isPresent) {
        throw new ForbiddenError("Email already registered")
    }

    const newOtp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });

    const redisClient = getRedisClient()

    await redisClient.set(`signup_otp:${email}`, newOtp, { EX: 300 })

    const mailData = {
        email,
        from: "Leetcode",
        subject: "For OTP verification",
        body: mailTemplate(newOtp)
    }

    // call mail service
    const response = await axios.post(MAIL_SERVICE_URL, mailData)

    if (!response.data.success)
        throw new InternalServerError("Couldnt send mail")

    return newOtp
}

export const signUp = async (data: (RegisterUserInput & { otp: string })) => {
    const { name, email, password, otp } = data

    const isUserRegistered = await User.findOne({
        email
    })

    if (isUserRegistered) {
        throw new ForbiddenError("Account already Registeresd")
    }

    const redisClient = getRedisClient()

    const latestOtp = await redisClient.get(`signup_otp:${email}`)

    if (!latestOtp) {
        throw new NotFoundError("Otp not found")
    }

    const newUser = await User.create({
        email, password, name
    });

    const payload = {
        email, name, userId: newUser._id
    }

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_JWT_KEY, { expiresIn: "15min" })
    const refreshToken = jwt.sign({ userId: newUser._id }, REFRESH_TOKEN_JWT_KEY, { expiresIn: "7d" })

    await redisClient.set(`session:${payload.userId}`, refreshToken, { EX: 7 * 24 * 60 * 60 })

    const userObj: {
        accessToken: string
        refreshToken: string
        password: null
    } & ReturnType<typeof newUser.toObject> = {
        ...newUser.toObject(),
        accessToken,
        refreshToken,
        password: null,
    }

    return userObj
}

export const login = async (data: LoginUserInput) => {
    const { email, password } = data

    const user = await User.findOne({ email })

    if (!user) {
        throw new NotFoundError("User not found")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new UnauthorizedError("Password not matched")
    }

    const payload = {
        email,
        name: user.name,
        userId: user._id
    }

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_JWT_KEY, { expiresIn: "15min" })
    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_JWT_KEY, { expiresIn: "7d" })
    
    const redisClient=getRedisClient()
    await redisClient.set(`session:${payload.userId}`, refreshToken, { EX: 7 * 24 * 60 * 60 })

    const userObj: {
        accessToken: string
        refreshToken: string
        password: null
    } & ReturnType<typeof user.toObject> = {
        ...user.toObject(),
        accessToken,
        refreshToken,
        password: null,
    }

    return userObj
}