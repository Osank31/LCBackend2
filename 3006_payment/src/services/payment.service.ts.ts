import {razorpay} from "../config/razorypay.config";
import {OrderOptions} from "../controllers/payment.controller";
import {InternalServerError} from "../utils/errors/AppError";
import crypto from "crypto"
import {neonPool} from "../config/db.condfig";
import {RAZORPAY_KEY_SECRET} from "../constants/constants";

export const createOrder = async (options: OrderOptions, userId: string) => {
    const response = await razorpay.orders.create(options);

    if (!response || !response.id || !response.currency || !response.amount) {
        throw new InternalServerError("Order creation error from razorpay");
    }

    // TODO: Add into DB
    const result = await neonPool.query(
        `
            INSERT INTO payments (
                user_id,
                amount,
                currency,
                status,
                payment_method,
                transaction_id
            )
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
        `,
        [
            userId,                  // user_id
            options.amount,            // amount
            options.currency,             // currency
            "pending",       // status
            response.id       // transaction_id
        ]
    );

    return {
        order_id: response.id,
        currency: response.currency,
        amount: response.amount,
    }
}

export const confirmPayment = (orderId: string,paymentId: string, signature: string) => {

    const body = orderId + "|" + paymentId;

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    // TODO: Update DB with payment confirmed

    return expectedSignature === signature;

}