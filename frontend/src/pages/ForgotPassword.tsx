import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
	Mail,
	Smartphone,
	KeyRound,
	AlertTriangle,
	CheckCircle,
	Loader2,
} from "lucide-react";
import api from "../api/api.service";

const ForgotPassword: React.FC = () => {
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [token, setToken] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	// Step 1: Submit Email for Reset OTP
	const handleRequestOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) {
			setError("Please provide your email address.");
			return;
		}

		setError(null);
		setLoading(true);

		try {
			const response = await api.post("/auth/forgot-password", { email });
			if (response.status === 201) {
				setSuccess(
					"Reset OTP has been sent to your email. Check your spam folder if not found."
				);
				setStep(2);
			}
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"Failed to send OTP. Please check the email entered."
			);
		} finally {
			setLoading(false);
		}
	};

	// Step 2: Verify OTP
	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!otp) {
			setError("OTP code is required.");
			return;
		}

		setError(null);
		setSuccess(null);
		setLoading(true);

		try {
			const response = await api.put("/auth/forgot-password-verify-otp", {
				email,
				otp,
			});
			if (response.data?.success && response.data?.data?.token) {
				setToken(response.data.data.token);
				setSuccess(
					"OTP verified successfully. You may now enter your new credentials."
				);
				setStep(3);
			} else {
				setError("Verification failed. Invalid or expired OTP.");
			}
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"OTP verification failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	// Step 3: Set New Password
	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password || !confirmPassword) {
			setError("Both password fields are required.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setError(null);
		setSuccess(null);
		setLoading(true);

		try {
			const response = await api.put("/auth/reset-password", {
				password,
				token,
			});
			if (response.data?.success) {
				setSuccess(
					"Your password has been reset successfully! Redirecting to login..."
				);

				setTimeout(() => {
					navigate("/login");
				}, 1500);
			}
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"Failed to reset password. Token may have expired."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-darkBg p-6">
			<div className="w-full max-w-md bg-darkPanel border border-darkBorder p-8">
				{/* Title Header */}
				<div className="mb-8">
					<h2 className="text-2xl font-mono font-bold tracking-tight text-white uppercase">
						KEY_RECOVERY
					</h2>
					<p className="text-xs text-text-secondary mt-1 font-mono uppercase">
						{step === 1 && "STEP 1: SUBMIT ACCOUNT EMAIL"}
						{step === 2 && "STEP 2: ENTER DISPATCHED OTP"}
						{step === 3 && "STEP 3: ASSIGN NEW PASSWORD"}
					</p>
				</div>

				{/* Messaging Feedback */}
				{error && (
					<div className="mb-6 flex items-start gap-2 bg-brandRed/10 border border-brandRed text-brandRed p-3.5 text-xs font-mono">
						<AlertTriangle className="shrink-0" size={16} />
						<div>
							<span className="font-bold">RECOVERY_ERROR:</span>{" "}
							{error.toUpperCase()}
						</div>
					</div>
				)}

				{success && (
					<div className="mb-6 flex items-start gap-2 bg-brandGreen/10 border border-brandGreen text-brandGreen p-3.5 text-xs font-mono">
						<CheckCircle className="shrink-0" size={16} />
						<div>
							<span className="font-bold">SYSTEM_SUCCESS:</span>{" "}
							{success.toUpperCase()}
						</div>
					</div>
				)}

				{step === 1 && (
					/* Step 1: Submit Email */
					<form onSubmit={handleRequestOtp} className="space-y-5">
						<div className="space-y-1.5">
							<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
								EMAIL_COORDINATES
							</label>
							<div className="relative flex items-center">
								<Mail
									className="absolute left-3 text-text-disabled"
									size={16}
								/>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
									placeholder="developer@lc.arena"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase border border-brandBlue hover:border-[#2563eb] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<Loader2
										size={16}
										className="animate-spin"
									/>
									<span>TRANSMITTING...</span>
								</>
							) : (
								<span>REQUEST_RESET_OTP</span>
							)}
						</button>
					</form>
				)}

				{step === 2 && (
					/* Step 2: Input OTP */
					<form onSubmit={handleVerifyOtp} className="space-y-5">
						<div className="space-y-1">
							<label className="block text-[10px] font-mono font-bold text-text-disabled uppercase">
								VERIFYING_ACCOUNT
							</label>
							<div className="px-3 py-2 bg-darkBg border border-darkBorder text-[#f3f4f6]/60 text-xs font-mono">
								{email}
							</div>
						</div>

						<div className="space-y-1.5">
							<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
								ENTER_4-DIGIT_OTP
							</label>
							<div className="relative flex items-center">
								<Smartphone
									className="absolute left-3 text-text-disabled"
									size={16}
								/>
								<input
									type="text"
									maxLength={4}
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white tracking-widest placeholder-text-disabled outline-none font-mono"
									placeholder="0000"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									setStep(1);
									setError(null);
									setSuccess(null);
								}}
								className="w-1/3 bg-darkBg hover:bg-darkHeader border border-darkBorder text-[#f3f4f6] py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider transition-colors duration-150 cursor-pointer"
								disabled={loading}
							>
								BACK
							</button>

							<button
								type="submit"
								disabled={loading}
								className="w-2/3 bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-xs tracking-widest uppercase border border-brandBlue hover:border-[#2563eb] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<Loader2
											size={14}
											className="animate-spin"
										/>
										<span>VERIFYING...</span>
									</>
								) : (
									<span>VERIFY_OTP_CODE</span>
								)}
							</button>
						</div>
					</form>
				)}

				{step === 3 && (
					/* Step 3: Set Password */
					<form onSubmit={handleResetPassword} className="space-y-5">
						{/* New Password */}
						<div className="space-y-1.5">
							<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
								NEW_SECRET_KEY
							</label>
							<div className="relative flex items-center">
								<KeyRound
									className="absolute left-3 text-text-disabled"
									size={16}
								/>
								<input
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
									placeholder="••••••••••••"
									required
									disabled={loading}
								/>
							</div>
						</div>

						{/* Confirm New Password */}
						<div className="space-y-1.5">
							<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
								CONFIRM_SECRET_KEY
							</label>
							<div className="relative flex items-center">
								<KeyRound
									className="absolute left-3 text-text-disabled"
									size={16}
								/>
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
									placeholder="••••••••••••"
									required
									disabled={loading}
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase border border-brandBlue hover:border-[#2563eb] transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<Loader2
										size={16}
										className="animate-spin"
									/>
									<span>COMMITTING_CHANGES...</span>
								</>
							) : (
								<span>RESET_SECRET_KEY</span>
							)}
						</button>
					</form>
				)}

				{/* Back to Login redirection link */}
				<div className="mt-8 pt-6 border-t border-darkBorder text-center">
					<Link
						to="/login"
						className="text-xs font-mono text-brandBlue hover:underline uppercase font-bold"
					>
						← BACK TO SIGN IN
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
