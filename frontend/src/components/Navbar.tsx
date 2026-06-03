import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	Terminal,
	Plus,
	LogOut,
	LogIn,
	UserPlus,
	ListCollapse,
} from "lucide-react";
import api from "../api/api.service";

const Navbar: React.FC = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			// Call logout endpoint to clear session in backend Redis/cookies
			await api.post("/auth/logout");
		} catch (err) {
			console.error("Logout error on backend:", err);
		} finally {
			// Always logout locally
			logout();
			navigate("/login");
		}
	};

	return (
		<nav className="bg-darkPanel border-b border-darkBorder h-14 flex items-center justify-between px-6 select-none">
			{/* Brand logo - sharp layout */}
			<Link
				to="/problems"
				className="flex items-center gap-2 text-white font-mono font-bold tracking-wider hover:text-brandBlue transition-colors duration-150"
			>
				<div className="bg-brandBlue text-white p-1 border border-brandBlue flex items-center justify-center">
					<Terminal size={18} strokeWidth={2.5} />
				</div>
				<span>LC_ARENA</span>
			</Link>

			{/* Navigation Links */}
			<div className="flex items-center gap-6">
				<Link
					to="/problems"
					className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-white transition-colors duration-150 py-1"
				>
					<ListCollapse size={16} />
					<span>PROBLEMS</span>
				</Link>

				{user && (
					<Link
						to="/problems/create"
						className="flex items-center gap-1.5 text-sm font-medium text-brandBlue hover:text-white transition-colors duration-150 py-1 border border-dashed border-brandBlue/50 px-2.5 py-0.5 bg-brandBlue/5"
					>
						<Plus size={14} />
						<span>NEW PROBLEM</span>
					</Link>
				)}
			</div>

			{/* Auth Control panel */}
			<div className="flex items-center gap-4">
				{user ? (
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 border border-darkBorder bg-darkBg px-3 py-1 font-mono text-xs">
							<div className="w-2 h-2 bg-brandGreen"></div>
							<span className="text-[#f3f4f6] font-semibold">
								{user.name.toUpperCase()}
							</span>
						</div>

						<button
							onClick={handleLogout}
							className="flex items-center gap-1.5 px-3 py-1 text-xs border border-brandRed bg-brandRed/10 text-brandRed hover:bg-brandRed hover:text-white transition-colors duration-150 cursor-pointer"
						>
							<LogOut size={12} />
							<span>LOGOUT</span>
						</button>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<Link
							to="/login"
							className="flex items-center gap-1 px-3 py-1 text-xs border border-darkBorder bg-darkBg text-[#f3f4f6] hover:bg-darkHeader transition-colors duration-150"
						>
							<LogIn size={12} />
							<span>LOGIN</span>
						</Link>
						<Link
							to="/register"
							className="flex items-center gap-1 px-3 py-1 text-xs border border-brandBlue bg-brandBlue text-white hover:bg-brandBlue/90 transition-colors duration-150"
						>
							<UserPlus size={12} />
							<span>REGISTER</span>
						</Link>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
