import {razorpay} from "../config/razorypay.config";
import {Orders} from "razorpay/dist/types/orders";
import {InternalServerError} from "../utils/errors/AppError";
import {RazorpayWebhookEvent} from "../controllers/payment.controller";
import {prisma} from "../config/db.condfig";


export interface OrderOptions {
    planId: string;
    currency: string;
    receipt: string;
    payment_capture: 0 | 1;
}

export const createOrder = async (options: Orders.RazorpayOrderCreateRequestBody | Orders.RazorpayTransferCreateRequestBody | Orders.RazorpayAuthorizationCreateRequestBody, userId: string, planId: string) => {
    const response = await razorpay.orders.create(options)

    if (!response || !response.id || !response.amount || !response.currency) {
        throw new InternalServerError("Order creation error from razorpay");
    }

    await prisma.order.create({
        data: {
            userId,
            planId,
            razorpayOrderId: response.id,
            amount: Number(response.amount),
            currency: response.currency,

            receipt: response.receipt,
        }
    });

    return {
        razorPayId: response.id,
        amount: response.amount,
        currency: response.currency,
        receipt: response.receipt,
    }
}


export const paymentCapture = (razorpay_order_id: string, razorpay_payment_id: string) => {
    return prisma.order.update({
        where: {
            razorpayOrderId: razorpay_order_id
        },
        data: {
            razorpayPaymentId: razorpay_payment_id,
            status: "PAID",
            paidAt: new Date(Date.now())
        }
    });
}

export const paymentWebhookCapture = async (data: RazorpayWebhookEvent) => {
    if (!data.payload.payment?.entity) {
        throw new InternalServerError("Payment does not exist");
    }

    const razorpayPaymentId = data.payload.payment.entity.id

    const isExist = await prisma.payment.findUnique({
        where: {
            razorpayPaymentId
        }
    });

    if (isExist) {
        return
    }


    const order_plan_Data = await prisma.order.findUnique({
        where: {
            razorpayOrderId: data.payload.payment.entity.order_id,
        },
        include: {
            plan: true
        }
    });

    if (!order_plan_Data) {
        throw new InternalServerError("Payment does not exist");
    }

    const paymentData = await prisma.payment.create({
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
    });


    return prisma.subscription.upsert({
        where: {
            userId: order_plan_Data.userId
        },
        create: {
            userId: order_plan_Data.userId,
            planId: order_plan_Data.planId,
            orderId: order_plan_Data.id,
            status: "ACTIVE",
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day (fixed)
        },
        update: {
            planId: order_plan_Data.planId,
            orderId: order_plan_Data.id,
            status: "ACTIVE",
            endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
    });
}