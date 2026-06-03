import { useEffect } from "react";
import { verifyPayment } from "../api/api.service";

declare global {
	interface Window {
		Razorpay: any;
	}
}

type Order = {
	orderId: string;
	amount: number;
	currency: string;
};

type Props = {
	order: Order;
	onClose: () => void;
};

const loadScript = (): Promise<boolean> => {
	return new Promise((resolve) => {
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";

		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);

		document.body.appendChild(script);
	});
};

export default function RazorpayCheckout({ order, onClose }: Props) {
	useEffect(() => {
		const init = async () => {
			const loaded = await loadScript();

			if (!loaded) {
				alert("Razorpay SDK failed to load");
				return;
			}

			const options = {
				key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
				amount: order.amount,
				currency: order.currency,
				name: "Test Store",
				order_id: order.orderId,

				handler: async (response: {
					razorpay_payment_id: string;
					razorpay_order_id: string;
					razorpay_signature: string;
				}) => {
					console.log("Payment Success:", response);

					try {
						await verifyPayment({
							orderId: response.razorpay_order_id,
							paymentId: response.razorpay_payment_id,
							signature: response.razorpay_signature,
						});

						alert("Payment Successful");
					} catch (err) {
						console.error("Verification failed", err);
					}

					onClose();
				},

				modal: {
					ondismiss: () => {
						console.log("Payment closed");
						onClose();
					},
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		};

		init();
	}, [order, onClose]);

	return null;
}
