import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { KeyRound, Mail, AlertTriangle, Loader2 } from "lucide-react";
import api from "../api/api.service";

const Login: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !password) {
			setError("Please provide email and password.");
			return;
		}

		setError(null);
		setLoading(true);

		try {
			const response = await api.post("/auth/login", { email, password });

			if (response.data?.success && response.data?.data) {
				const { accessToken, ...userProfile } = response.data.data;
				login(userProfile, accessToken);
				navigate("/problems");
			} else {
				setError("Login failed. Please check your credentials.");
			}
		} catch (err: any) {
			setError(
				err.response?.data?.message ||
					"Invalid email or password. Please try again."
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
						SIGN_IN
					</h2>
					<p className="text-xs text-text-secondary mt-1 font-mono">
						ENTER YOUR CREDENTIALS TO ENTER THE ARENA
					</p>
				</div>

				{/* Errors display - flat high contrast amber/red */}
				{error && (
					<div className="mb-6 flex items-start gap-2 bg-brandRed/10 border border-brandRed text-brandRed p-3.5 text-xs font-mono">
						<AlertTriangle className="shrink-0" size={16} />
						<div>
							<span className="font-bold">
								AUTHENTICATION_ERROR:
							</span>{" "}
							{error.toUpperCase()}
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* Email field */}
					<div className="space-y-1.5">
						<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
							EMAIL_ADDRESS
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

					{/* Password field */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<label className="block text-xs font-mono font-bold text-text-secondary uppercase">
								SECRET_KEY
							</label>
							<Link
								to="/forgot-password"
								className="text-[10px] font-mono text-brandBlue hover:underline uppercase"
							>
								Forgot Password?
							</Link>
						</div>
						<div className="relative flex items-center">
							<KeyRound
								className="absolute left-3 text-text-disabled"
								size={16}
							/>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
								placeholder="••••••••••••"
								required
								disabled={loading}
							/>
						</div>
					</div>

					{/* Submit Action */}
					<button
						type="submit"
						disabled={loading}
						className="w-full mt-4 bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase transition-colors duration-150 ease-in-out border border-brandBlue hover:border-[#2563eb] cursor-pointer flex items-center justify-center gap-2"
					>
						{loading ? (
							<>
								<Loader2 size={16} className="animate-spin" />
								<span>PROCESSING...</span>
							</>
						) : (
							<span>ACCESS_ARENA</span>
						)}
					</button>
				</form>

				{/* Footer redirection links */}
				<div className="mt-8 pt-6 border-t border-darkBorder text-center">
					<p className="text-xs text-text-secondary font-mono">
						NEW_RECRUIT?{" "}
						<Link
							to="/register"
							className="text-brandBlue hover:underline font-bold uppercase"
						>
							Register Here
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;
