import { Router } from "express";
import { createOrder, paymentCapture } from "../controllers/payment.controller";

const router = Router();

router.post("/order", createOrder);
router.post("/paymentCapture", paymentCapture);

export default router;
