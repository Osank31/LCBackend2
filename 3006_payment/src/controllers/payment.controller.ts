import { Request, Response, NextFunction } from "express";
import {
	razorpay,
	RAZORPAY_KEY_ID,
	RAZORPAY_KEY_SECRET,
} from "../config/razorypay.config";
import { sendSuccess } from "../utils/Response";
import crypto from "crypto";
import { InternalServerError } from "../utils/errors/AppError";
import logger from "../config/logger.config";

const secret_key = "1234567890";

interface OrderOptions {
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
	const options: OrderOptions = {
		amount: req.body.amount,
		currency: "INR",
		payment_capture: 1,
		receipt: "order10",
	};

	try {
		const response = await razorpay.orders.create(options);
		sendSuccess(
			res,
			{
				order_id: response.id,
				currency: response.currency,
				amount: response.amount,
			},
			"Order created successfully",
			201
		);
	} catch (e) {
		logger.error(e);
		next(e);
	}
};

export const paymentCapture = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { orderId, paymentId, signature } = req.body;

		const body = orderId + "|" + paymentId;

		const expectedSignature = crypto
			.createHmac("sha256", RAZORPAY_KEY_SECRET)
			.update(body)
			.digest("hex");

		if (expectedSignature === signature) {
			return sendSuccess(res, null, "Payemnt verified successfully.");
		}
		console.log("failure", signature);
		return res
			.status(400)
			.json({ success: false, message: "Invalid signature" });
	} catch (error) {
		next(error);
	}
};
