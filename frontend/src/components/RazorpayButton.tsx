import { useState } from "react";
import { createOrder } from "../api/api.service";
import RazorpayCheckout from "./RazorpayCheckout";

export default function RazorpayButton() {
	const [order, setOrder] = useState<null | {
		orderId: string;
		amount: number;
		currency: string;
	}>(null);

	const handlePayment = async () => {
		try {
			const res = await createOrder(100);

			console.log(res);

			setOrder({
				orderId: res.data.data.order_id,
				amount: res.data.data.amount,
				currency: res.data.data.currency,
			});
		} catch (err) {
			console.log("Order creation failed", err);
		}
	};

	return (
		<div>
			<button onClick={handlePayment}>Pay ₹100</button>

			{order && (
				<RazorpayCheckout
					order={order}
					onClose={() => setOrder(null)}
				/>
			)}
		</div>
	);
}
