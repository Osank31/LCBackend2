import { Router } from "express";
import { createOrder, paymentCapture } from "../controllers/payment.controller";
import {userValidation} from "../middleware/user.validation";

const router = Router();

router.post("/order", userValidation, createOrder);
router.post("/paymentCapture", userValidation, paymentCapture);

export default router;
