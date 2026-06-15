import { Router } from "express";
import { forgetPassword, forgotPasswordVerifyOtp, login, logout, reloadToken, resetPassword, sendEmail, signUp } from "../controllers/auth.controller";
import { updateUserRole } from "../controllers/profile.contoroller";

const router = Router()

router.post("/send-mail-auth", sendEmail)
router.post("/sign-up", signUp)
router.post("/login", login)
router.post("/forgot-password", forgetPassword)
router.put("/forgot-password-verify-otp", forgotPasswordVerifyOtp)
router.put("/reset-password", resetPassword)
router.post("/reload-token", reloadToken)
router.post("/updateRole", updateUserRole)
router.post("/logout", logout)


export default router