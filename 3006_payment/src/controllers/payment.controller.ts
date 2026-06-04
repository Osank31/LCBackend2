import {Request, Response, NextFunction} from "express";
import {sendSuccess} from "../utils/Response";
import crypto from "crypto";
import * as PaymentService from "../services/payment.service.ts"
import {BadRequestError, NotFoundError} from "../utils/errors/AppError";

export interface OrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    payment_capture: 0 | 1;
}

export const createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const options: OrderOptions = {
            amount: req.body.amount,
            currency: "INR",
            payment_capture: 1,
            receipt: `order_${crypto.randomUUID()}`,
        };

		if (!req.user?.userId) {
			throw new NotFoundError("User does not exist");
		}

		const data = PaymentService.createOrder(options, req.user?.userId)

		sendSuccess(
		    res,
		    data,
		    "Order created successfully",
		    201
		);
    } catch (e) {
        next(e)
    }


};

export const paymentCapture = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {orderId, paymentId, signature} = req.body;

		if (PaymentService.confirmPayment(orderId, paymentId, signature))
			return sendSuccess(res, null, "Payment verified successfully.");
		else
			throw new BadRequestError("Payment verification failed");
    } catch (error) {
        next(error);
    }
};
