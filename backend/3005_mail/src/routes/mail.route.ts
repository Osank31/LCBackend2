import { Router } from "express";
import { sendMail } from "../controllers/mail.controllers";

const router = Router()

router.post("/api/v1/", sendMail)

export default router