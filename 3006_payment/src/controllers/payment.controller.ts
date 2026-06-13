import {Request, Response, NextFunction} from "express";
import {OrderOptions} from "../services/payment.service";
import {NotFoundError} from "../utils/errors/AppError";
// import {sendSuccess} from "../utils/Response";
// import crypto from "crypto";
import * as PaymentService from "../services/payment.service"
import {sendSuccess} from "../utils/Response";


export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("order created");
        const options: OrderOptions = {
            amount: req.body.amount,
            currency: req.body.currency || ("INR"),
            payment_capture: 1,
            receipt: `ORDER_${Date.now()}`,
        };

        if (!req.user?.userId) {
			throw new NotFoundError("User does not exist");
		}

        const data = await PaymentService.createOrder(options);

        sendSuccess(res, data, "Payment Generated Successfully");

    } catch (e) {
        next(e);
    }
}

export interface RazorpayWebhookEvent {
    entity: "event";
    account_id: string;
    event: string; // e.g. "payment.captured" || "payment.failed"
    contains: string[];
    payload: {
        payment?: {
            entity: RazorpayPaymentEntity;
        };
    };
    created_at: number;
}

export interface RazorpayPaymentEntity {
    id: string;
    entity: "payment";

    amount: number;
    currency: string;

    status: string; // "captured", "failed", etc.

    order_id: string;
    invoice_id: string | null;

    international: boolean;
    method: string;

    amount_refunded: number;
    refund_status: string | null;

    captured: boolean;
    description: string | null;

    email?: string;
    contact?: string;

    notes: any[];

    created_at: number;
}

export const paymentCapture = async (req: Request, res: Response, next: NextFunction) => {
    try{
        console.log("payment capture");
        const data = req.body as RazorpayWebhookEvent;

        await PaymentService.verifyPayment(data)

        sendSuccess(res, null, "Payment Captured Successfully", 200);
    } catch (e) {
        next(e);
    }
}