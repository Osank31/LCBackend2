import {Request, Response, NextFunction} from "express";
import {OrderOptions} from "../services/payment.service";
import {NotFoundError} from "../utils/errors/AppError";
import * as PaymentService from "../services/payment.service"
import * as PlanService from "../services/plans.service"
import crypto from "crypto";
import {sendError, sendSuccess} from "../utils/Response";


export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("order created");
        const options: OrderOptions = {
            planId: req.body.planId,
            currency: req.body.currency || ("INR"),
            payment_capture: 1,
            receipt: `ORDER_${Date.now()}`,
        };

        const userId = req.user?.userId

        if (!userId) {
			throw new NotFoundError("User does not exist");
		}

        const plan = await PlanService.getPlanById(options.planId)

        if (!plan) {
            throw new NotFoundError("Plans already exist");
        }

        const data = await PaymentService.createOrder({
            amount: plan.amount,
            currency: req.body.currency || ("INR"),
            payment_capture: true,
            receipt: `ORDER_${Date.now()}`,
        }, userId, options.planId);

        sendSuccess(res, data, "Payment Generated Successfully");
    } catch (e) {
        next(e);
    }
}


export const paymentCapture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const userId = req.user?.userId;

        if (!userId) {
            throw new NotFoundError("User not found");
        }

        // 1. Create signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        // 2. Compare signatures
        const isValid = expectedSignature === razorpay_signature;

        if (!isValid) {
            return sendError(res, "Signature unidentified")
        }

        await PaymentService.paymentCapture(razorpay_order_id, razorpay_payment_id);

        return sendSuccess(res, "Payment Captured Successfully");
    } catch (e) {
        next(e);
    }
};

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

export const paymentWebhookCapture = async (req: Request, res: Response, next: NextFunction) => {
    try{
        console.log("payment capture");
        const data = req.body as RazorpayWebhookEvent;

        await PaymentService.paymentWebhookCapture(data);

        sendSuccess(res, null, "Payment Captured Successfully", 200);
    } catch (e) {
        next(e);
    }
}