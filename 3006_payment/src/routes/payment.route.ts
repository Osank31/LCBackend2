import { Router } from "express";
import {createOrder, paymentWebhookCapture, paymentCapture} from "../controllers/payment.controller";
import {userValidation} from "../middleware/user.validation";

const router = Router();

router.post("/order", userValidation, createOrder);
router.put("/verify-payment", paymentCapture);
router.post("/webhooks/razorpay/paymentCapture", paymentWebhookCapture);

export default router;
