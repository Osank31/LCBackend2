import { Router } from "express";
import { forgetPassword, forgotPasswordVerifyOtp, login, logout, refrshToken, resetPassword, sendEmail, signUp } from "../controllers/auth.controller";

const router = Router()

router.post("/send-mail-auth", sendEmail)
router.post("/sign-up", signUp)
router.post("/login", login)
router.post("/forgot-password", forgetPassword)
router.put("/forgot-password-verify-otp", forgotPasswordVerifyOtp)
router.put("/reset-password", resetPassword)
router.post("/refresh-token", refrshToken)
router.post("/logout", logout)

export default router