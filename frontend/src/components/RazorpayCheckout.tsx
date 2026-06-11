import { useEffect } from "react";

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

				order_id: order.orderId,
				amount: order.amount,
				currency: order.currency,

				name: "Test Store",
				description: "Payment Checkout",

				// ⚠️ No backend verification call here anymore
				handler: (response: any) => {
					console.log("Payment completed:", response);

					// You can optionally show UI message
					alert("Payment successful! Processing your order...");

					// Backend webhook will handle final confirmation
					onClose();
				},

				modal: {
					ondismiss: () => {
						console.log("Payment modal closed");
						onClose();
					},
				},

				theme: {
					color: "#3399cc",
				},
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		};

		init();
	}, [order, onClose]);

	return null;
}