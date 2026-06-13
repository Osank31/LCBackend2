// import {razorpay} from "../config/razorypay.config";
// import {OrderOptions} from "../controllers/payment.controller";
// import {InternalServerError} from "../utils/errors/AppError";
// import crypto from "crypto"
// import {RAZORPAY_KEY_SECRET} from "../constants/constants";
// import {prisma} from "../config/db.condfig";
//
// export enum PaymentStatus {
//     completed = "completed",
//     pending = "pending",
//     failed = "failed",
//     refunded = "refunded",
// }
//
//
// export const createOrder = async (options: OrderOptions, userId: string) => {
//     const response = await razorpay.orders.create(options);
//
//     if (!response || !response.id || !response.currency || !response.amount) {
//         throw new InternalServerError("Order creation error from razorpay");
//     }
//
//     // TODO: Add into Prisma DB
//     const order = await prisma.payment.create({
//         data: {
//             amount: response.amount,
//             currency: response.currency,
//             status: "pending",
//             userId: userId,
//             transactionId: response.id
//         }
//     })
//
//     return {
//         order_id: response.id,
//         currency: response.currency,
//         amount: response.amount,
//         userId,
//         paymentId: order.id
//     }
// }
//
// export const confirmPayment = async (orderId: string, paymentId: string, signature: string, userId: string) => {
//
//     const body = orderId + "|" + paymentId;
//
//     const expectedSignature = crypto
//         .createHmac("sha256", RAZORPAY_KEY_SECRET)
//         .update(body)
//         .digest("hex");
//
//
//     if (expectedSignature === signature) {
//         // TODO: Update Prisma DB with payment confirmed and Mongo DB
//         const payment = await prisma.payment.update({
//             where: {
//                 id: paymentId,
//             },
//             data: {
//                 status: PaymentStatus.completed,
//             },
//         });
//         return true;
//     }
//     return false;
//
// }


import {razorpay} from "../config/razorypay.config";
import {Orders} from "razorpay/dist/types/orders";
import {InternalServerError} from "../utils/errors/AppError";
import {RazorpayWebhookEvent} from "../controllers/payment.controller";
import {prisma} from "../config/db.condfig";

export interface OrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    payment_capture: 0 | 1;
}

export const createOrder = async (options: Orders.RazorpayOrderCreateRequestBody | Orders.RazorpayTransferCreateRequestBody | Orders.RazorpayAuthorizationCreateRequestBody) => {
    const response = await razorpay.orders.create(options)

    // console.log(response)

    if (!response || !response.id || !response.amount || !response.currency) {
        throw new InternalServerError("Order creation error from razorpay");
    }

    return {
        razorPayId: response.id,
        amount: response.amount,
        currency: response.currency,
        receipt: response.receipt,
    }
}

export const verifyPayment = async (data: RazorpayWebhookEvent) => {
    if (!data.payload.payment?.entity) {
        throw new InternalServerError("Payment does not exist");
    }

    console.log("here")

    const razorpayPaymentId = data.payload.payment.entity.id

    const isExist = await prisma.payment.findUnique({
        where: {
            razorpayPaymentId
        }
    });

    if (isExist) {
        return
    }


    await prisma.payment.create({
        data: {
            razorpayPaymentId,
            razorpayOrderId: data.payload.payment.entity.order_id,
            razorpayInvoiceId: data.payload.payment.entity.invoice_id || null,

            amount: data.payload.payment.entity.amount,
            currency: data.payload.payment.entity.currency,
            status: data.payload.payment.entity.status,
            captured: data.payload.payment.entity.captured,

            method: data.payload.payment.entity.method,
            international: data.payload.payment.entity.international,
            amountRefunded: data.payload.payment.entity.amount_refunded,
            refundStatus: data.payload.payment.entity.refund_status,

            email: data.payload.payment.entity.email,
            contact: data.payload.payment.entity.contact,

            description: data.payload.payment.entity.description,
            notes: data.payload.payment.entity.notes,

            paymentCreatedAt: new Date(data.created_at * 1000)
        }
    })
}