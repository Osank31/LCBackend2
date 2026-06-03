import React, { createContext, useState, useEffect, useContext } from "react";

interface UserProfile {
	_id: string;
	name: string;
	email: string;
	profilePicUrl?: string;
}

interface AuthContextType {
	user: UserProfile | null;
	accessToken: string | null;
	login: (userData: UserProfile, token: string) => void;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Restore authentication details from localStorage on app boot
		const storedUser = localStorage.getItem("user");
		const storedToken = localStorage.getItem("accessToken");

		if (storedUser && storedToken) {
			setUser(JSON.parse(storedUser));
			setAccessToken(storedToken);
		}
		setLoading(false);
	}, []);

	const login = (userData: UserProfile, token: string) => {
		setUser(userData);
		setAccessToken(token);
		localStorage.setItem("user", JSON.stringify(userData));
		localStorage.setItem("accessToken", token);
	};

	const logout = () => {
		setUser(null);
		setAccessToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("accessToken");
	};

	return (
		<AuthContext.Provider
			value={{ user, accessToken, login, logout, loading }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
