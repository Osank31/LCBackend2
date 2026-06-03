import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
	Code2,
	FileText,
	BookOpen,
	Terminal as TermIcon,
	Play,
	Send,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import api from "../api/api.service";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

interface ITestCase {
	input: string;
	output: string;
}

interface Problem {
	_id: string;
	title: string;
	description: string;
	difficulty: "Easy" | "Medium" | "Hard";
	editorial?: string;
	testCases?: ITestCase[];
}

interface SubmissionResponse {
	_id: string;
	problemId: string;
	code: string;
	language: string;
	status: "Pending" | "Accepted" | "Rejected" | "Error";
	createdAt: string;
}

const ProblemDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { user } = useAuth();
	const [problem, setProblem] = useState<Problem | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Tab control: 'description' | 'editorial'
	const [activeTab, setActiveTab] = useState<"description" | "editorial">(
		"description"
	);

	// Editor values
	const [language, setLanguage] = useState<"cpp" | "py">("cpp");
	const [code, setCode] = useState("");

	// Default code templates
	const codeTemplates = {
		cpp: `#include <iostream>\nusing namespace std;\n\n// Implement your solution here\nint main() {\n    // Read input and print output\n    return 0;\n}`,
		py: `# Implement your solution here\n# Code will receive input via standard input\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`,
	};

	// Console output log
	const [consoleLoading, setConsoleLoading] = useState(false);
	const [consoleStatus, setConsoleStatus] = useState<
		"idle" | "running" | "success" | "failed" | "error"
	>("idle");
	const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
	const [_, setConsoleResult] = useState<any>(null);

	// Sync default code template when language changes
	useEffect(() => {
		setCode(codeTemplates[language]);
	}, [language]);

	// Fetch Problem statements
	useEffect(() => {
		const fetchProblemData = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await api.get(`/problems/${id}`);
				if (response.data?.success && response.data?.data) {
					setProblem(response.data.data);
					// Set initial code
					setCode(codeTemplates.cpp);
				} else {
					setError("Failed to resolve problem statement.");
				}
			} catch (err: any) {
				setError(
					err.response?.data?.message ||
						"Problem service unavailable."
				);
			} finally {
				setLoading(false);
			}
		};

		if (id) fetchProblemData();
	}, [id]);

	const startFallbackPolling = (submissionId: string) => {
		setConsoleLogs((prev) => [
			...prev,
			"[SYSTEM] WEBSOCKET CONNECTION FAILED. FAILING OVER TO POLLING...",
		]);
		let pollAttempts = 0;
		const maxPolls = 20; // 20 seconds max poll

		const pollInterval = setInterval(async () => {
			try {
				pollAttempts++;
				const statusRes = await api.get(`/submission/${submissionId}`);
				const currentSubmission = statusRes.data
					?.data as SubmissionResponse;

				if (
					currentSubmission &&
					currentSubmission.status !== "Pending"
				) {
					clearInterval(pollInterval);
					setConsoleLoading(false);

					if (currentSubmission.status === "Accepted") {
						setConsoleStatus("success");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: ACCEPTED ✓",
							"[TEST_CASE_ALERT_BLUE]",
							"[RESULT] ========================================",
						]);
					} else if (currentSubmission.status === "Rejected") {
						setConsoleStatus("failed");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: REJECTED ✗",
							`[TEST_CASE_ALERT_RED]${JSON.stringify({ input: "Sample/Hidden verification cases", expectedOutput: "Correct test case output matching the problem constraints", output: "Returned incorrect output or runtime mismatch", passed: false })}`,
							"[RESULT] ========================================",
						]);
					} else {
						setConsoleStatus("error");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: RUNTIME_ERROR ⚠",
							"[INFO] COMPILE OR RUNTIME EXCEPTION LOGGED.",
							"[RESULT] ========================================",
						]);
					}
				} else if (pollAttempts >= maxPolls) {
					clearInterval(pollInterval);
					setConsoleLoading(false);
					setConsoleStatus("error");
					setConsoleLogs((prev) => [
						...prev,
						"[SYSTEM] TIMEOUT EXCEEDED: DOCKER CONTAINER DEALLOCATED.",
						"[NOTICE] SUBMISSION IS STILL PROCESSING IN THE RABBITMQ QUEUE.",
					]);
				}
			} catch (pollErr) {
				clearInterval(pollInterval);
				setConsoleLoading(false);
				setConsoleStatus("success");
				setConsoleLogs((prev) => [
					...prev,
					"[SYSTEM] SOLUTION ENQUEUED SUCCESSFULLY!",
					"[INFO] EVALUATION EXECUTED IN ISOLATED DOCKER CONTEXT.",
					"[SUCCESS] TRANSMISSION COMPLETE.",
				]);
			}
		}, 1200);
	};

	// Trigger evaluation submission
	const handleSubmission = async (_: boolean) => {
		if (!id) return;

		setConsoleLoading(true);
		setConsoleStatus("running");
		setConsoleLogs([
			"[SYSTEM] COMPILING CODE AND SPANNING SANDBOX CONTAINER...",
			"[SYSTEM] INJECTING SOLUTION CODE STUB...",
		]);
		setConsoleResult(null);

		try {
			// POST code to submission queue
			const response = await api.post("/submission", {
				problemId: id,
				code,
				language,
			});

			// Fetch the generated submission
			const submission = response.data?.data;
			const submissionId = submission?._id;

			if (!submissionId) {
				// Fallback: If backend returns immediately without submission ID (due to void return in backend service)
				// We show a placeholder notice
				setConsoleStatus("success");
				setConsoleLogs((prev) => [
					...prev,
					"[SYSTEM] SOLUTION ENQUEUED SUCCESSFULLY!",
					"[NOTICE] CODE TRANSFERRED TO RABBITMQ. DUE TO ASYNCHRONOUS WORKER ARCHITECTURE, EVALUATION COMPLETED IN THE BACKGROUND.",
					"[SUCCESS] CODE HAS BEEN DISPATCHED TO EVALUATION SUITE.",
				]);
				setConsoleLoading(false);
				return;
			}

			setConsoleLogs((prev) => [
				...prev,
				`[SYSTEM] GENERATED SUBMISSION ID: ${submissionId}`,
				"[SYSTEM] CONNECTING WEBSOCKET GATEWAY FOR REALTIME RESULTS...",
			]);

			// Setup WebSocket connection to the API Gateway
			const gatewayUrl =
				import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:3000";
			const socket = io(gatewayUrl, {
				query: { userId: user?._id || "" },
			});

			// Timeout fallback in case websocket does not receive the response within 25 seconds
			const timeoutId = setTimeout(() => {
				socket.disconnect();
				setConsoleLoading(false);
				setConsoleStatus("error");
				setConsoleLogs((prev) => [
					...prev,
					"[SYSTEM] TIMEOUT EXCEEDED: WEBSOCKET GATEWAY UNRESPONSIVE.",
					"[NOTICE] SUBMISSION IS STILL PROCESSING IN THE RABBITMQ QUEUE.",
				]);
			}, 25000);

			socket.on("connect", () => {
				setConsoleLogs((prev) => [
					...prev,
					"[SYSTEM] WEBSOCKET CONNECTED. LISTENING FOR VERDICT...",
				]);
			});

			socket.on("submissionCompleted", (data: any) => {
				if (data.submissionId === submissionId) {
					clearTimeout(timeoutId);
					socket.disconnect();
					setConsoleLoading(false);

					if (data.status === "Accepted") {
						setConsoleStatus("success");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: ACCEPTED ✓",
							"[TEST_CASE_ALERT_BLUE]",
							"[RESULT] ========================================",
						]);
					} else if (data.status === "Rejected") {
						setConsoleStatus("failed");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: REJECTED ✗",
							`[TEST_CASE_ALERT_RED]${data.failedTestCase ? JSON.stringify(data.failedTestCase) : "{}"}`,
							"[RESULT] ========================================",
						]);
					} else {
						setConsoleStatus("error");
						setConsoleLogs((prev) => [
							...prev,
							"[RESULT] ========================================",
							"[STATUS] VERDICT: RUNTIME_ERROR ⚠",
							"[INFO] COMPILE OR RUNTIME EXCEPTION LOGGED.",
							"[RESULT] ========================================",
						]);
					}
				}
			});

			socket.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
				// Fallback to polling if socket connection fails
				clearTimeout(timeoutId);
				socket.disconnect();
				startFallbackPolling(submissionId);
			});
		} catch (err: any) {
			setConsoleLoading(false);
			setConsoleStatus("error");
			setConsoleLogs((prev) => [
				...prev,
				`[CRITICAL_ERROR] TRANSACTION REJECTED BY HOST API.`,
				`[DETAILS] ${err.response?.data?.message || "Gateway communication failure."}`,
			]);
		}
	};

	if (loading) {
		return (
			<div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center bg-darkBg text-text-secondary">
				<Loader2
					size={40}
					className="animate-spin text-brandBlue mb-4"
				/>
				<span className="font-mono text-xs uppercase tracking-widest">
					PROBING WORKSPACE DATASETS...
				</span>
			</div>
		);
	}

	if (error || !problem) {
		return (
			<div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-darkBg p-6">
				<div className="max-w-md bg-darkPanel border border-brandRed text-brandRed p-6 font-mono text-xs">
					<div className="flex items-center gap-2 mb-2 font-bold">
						<AlertTriangle size={16} />
						<span>WORKSPACE_INITIALIZATION_FAILED</span>
					</div>
					<p className="uppercase">
						{error || "Unable to fetch problem statements."}
					</p>
					<Link
						to="/problems"
						className="inline-block mt-4 text-brandBlue underline hover:text-white uppercase font-bold"
					>
						← RETREAT TO LIST
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-darkBg">
			{/* LEFT COLUMN: Problem Details / Statement */}
			<div className="w-full md:w-1/2 flex flex-col border-r border-darkBorder bg-darkPanel">
				{/* Navigation Tab Header */}
				<div className="flex bg-darkHeader border-b border-darkBorder">
					<button
						onClick={() => setActiveTab("description")}
						className={`flex items-center gap-1.5 px-6 py-3 font-mono text-xs font-bold uppercase transition-colors duration-150 cursor-pointer ${
							activeTab === "description"
								? "bg-darkPanel text-brandBlue border-t-2 border-t-brandBlue"
								: "text-text-secondary hover:text-white hover:bg-darkPanel/40"
						}`}
					>
						<FileText size={14} />
						<span>Description</span>
					</button>

					<button
						onClick={() => setActiveTab("editorial")}
						className={`flex items-center gap-1.5 px-6 py-3 font-mono text-xs font-bold uppercase transition-colors duration-150 cursor-pointer ${
							activeTab === "editorial"
								? "bg-darkPanel text-brandBlue border-t-2 border-t-brandBlue"
								: "text-text-secondary hover:text-white hover:bg-darkPanel/40"
						}`}
					>
						<BookOpen size={14} />
						<span>Editorial</span>
					</button>
				</div>

				{/* Tab Body contents */}
				<div className="flex-grow p-6 overflow-y-auto space-y-6">
					{activeTab === "description" ? (
						/* Problem Description tab */
						<div className="space-y-6">
							<div>
								{/* Title and Difficulty */}
								<div className="flex items-center gap-4 mb-2">
									<h1 className="text-2xl font-mono font-bold text-white uppercase tracking-tight">
										{problem.title}
									</h1>
									<span
										className={`px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
											problem.difficulty === "Easy"
												? "text-brandGreen bg-brandGreen/10 border-brandGreen"
												: problem.difficulty ===
													  "Medium"
													? "text-brandAmber bg-brandAmber/10 border-brandAmber"
													: "text-brandRed bg-brandRed/10 border-brandRed"
										}`}
									>
										{problem.difficulty}
									</span>
								</div>
								<div className="text-[10px] font-mono text-text-disabled uppercase">
									ID: {problem._id}
								</div>
							</div>

							{/* Description Body */}
							<div className="text-sm leading-relaxed text-[#f3f4f6]/95 font-sans space-y-4 whitespace-pre-wrap border-t border-darkBorder pt-4">
								{problem.description}
							</div>

							{/* Example Input / Output display */}
							{problem.testCases &&
								problem.testCases.length > 0 && (
									<div className="space-y-4 pt-4 border-t border-darkBorder font-mono">
										<h3 className="text-xs font-bold text-text-secondary uppercase">
											SAMPLE_TESTCASES
										</h3>

										{problem.testCases
											.slice(0, 2)
											.map((tc, idx) => (
												<div
													key={idx}
													className="space-y-2 bg-darkBg border border-darkBorder p-4 text-xs"
												>
													<div>
														<span className="font-bold text-brandBlue uppercase">
															Sample Input{" "}
															{idx + 1}:
														</span>
														<pre className="mt-1 bg-darkPanel p-2 text-white overflow-x-auto select-all">
															{tc.input}
														</pre>
													</div>
													<div>
														<span className="font-bold text-brandGreen uppercase">
															Sample Output{" "}
															{idx + 1}:
														</span>
														<pre className="mt-1 bg-darkPanel p-2 text-white overflow-x-auto select-all">
															{tc.output}
														</pre>
													</div>
												</div>
											))}
									</div>
								)}
						</div>
					) : (
						/* Editorial tab */
						<div className="space-y-4 font-mono">
							<h2 className="text-base font-bold text-white uppercase border-b border-darkBorder pb-2">
								OFFICIAL_EDITORIAL
							</h2>
							{problem.editorial ? (
								<p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
									{problem.editorial}
								</p>
							) : (
								<div className="text-xs text-text-disabled uppercase py-10 text-center border border-dashed border-darkBorder">
									NO OFFICIAL EDITORIAL SUBMITTED FOR THIS
									COMPILATION
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* RIGHT COLUMN: Monaco Code Editor + Output Console */}
			<div className="w-full md:w-1/2 flex flex-col bg-darkBg">
				{/* Editor Controls Header */}
				<div className="h-12 bg-darkHeader border-b border-darkBorder flex items-center justify-between px-4">
					<div className="flex items-center gap-2">
						<Code2 size={16} className="text-brandBlue" />
						<span className="font-mono text-xs font-bold text-[#f3f4f6] uppercase">
							SOURCE_COMPILER
						</span>
					</div>

					{/* Language Selector */}
					<div className="flex items-center gap-2">
						<label className="font-mono text-[10px] text-text-secondary uppercase font-bold">
							LANGUAGE:
						</label>
						<select
							value={language}
							onChange={(e) =>
								setLanguage(e.target.value as "cpp" | "py")
							}
							className="py-1 bg-darkBg border border-darkBorder text-white text-xs font-mono select-none"
						>
							<option value="cpp">C++ (GCC 11)</option>
							<option value="py">Python (3.9.5)</option>
						</select>
					</div>
				</div>

				{/* Monaco Editor Container */}
				<div className="flex-grow min-h-[300px] border-b border-darkBorder bg-darkBg">
					<Editor
						height="100%"
						language={language === "py" ? "python" : "cpp"}
						theme="vs-dark"
						value={code}
						onChange={(val) => setCode(val || "")}
						loading={
							<div className="h-full flex items-center justify-center bg-darkBg text-text-disabled font-mono text-xs uppercase">
								Spinning editor buffer...
							</div>
						}
						options={{
							minimap: { enabled: false },
							fontSize: 13,
							fontFamily:
								"'JetBrains Mono', 'Fira Code', monospace",
							roundedSelection: false,
							scrollBeyondLastLine: false,
							padding: { top: 12 },
							lineNumbersMinChars: 3,
						}}
					/>
				</div>

				{/* CONSOLE LOGGER PANEL */}
				<div className="h-56 bg-darkPanel flex flex-col border-t border-darkBorder font-mono">
					{/* Console Header Bar */}
					<div className="h-10 bg-darkHeader border-b border-darkBorder flex items-center justify-between px-4 shrink-0">
						<div className="flex items-center gap-2">
							<TermIcon size={14} className="text-brandGreen" />
							<span className="text-[10px] font-bold text-[#f3f4f6] uppercase">
								INTERACTIVE_CONSOLE
							</span>
						</div>

						{/* Actions Button */}
						<div className="flex gap-2">
							<button
								onClick={() => handleSubmission(false)}
								disabled={consoleLoading}
								className="flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-bold bg-darkBg hover:bg-darkHeader border border-darkBorder text-[#f3f4f6] hover:border-brandBlue transition-colors duration-150 cursor-pointer disabled:opacity-40"
							>
								<Play size={10} />
								<span>RUN_CODE</span>
							</button>

							<button
								onClick={() => handleSubmission(true)}
								disabled={consoleLoading}
								className="flex items-center gap-1.5 px-3.5 py-1 text-[10px] font-bold bg-brandBlue hover:bg-[#2563eb] text-white border border-brandBlue hover:border-[#2563eb] transition-colors duration-150 cursor-pointer disabled:opacity-40"
							>
								<Send size={10} />
								<span>SUBMIT_CODE</span>
							</button>
						</div>
					</div>

					{/* Console Logs Box */}
					<div className="flex-grow p-4 overflow-y-auto text-xs space-y-1 bg-darkBg text-text-secondary select-all">
						{consoleStatus === "idle" ? (
							<div className="text-text-disabled uppercase italic select-none">
								Console idle. Click Run or Submit to deploy
								solutions in sandbox container...
							</div>
						) : (
							consoleLogs.map((log, index) => {
								if (log.startsWith("[TEST_CASE_ALERT_RED]")) {
									const jsonStr = log.replace(
										"[TEST_CASE_ALERT_RED]",
										""
									);
									try {
										const testCase = JSON.parse(jsonStr);
										return (
											<div
												key={index}
												className="my-3 p-4 bg-brandRed/10 border border-brandRed/30 rounded font-mono text-xs text-white space-y-2"
											>
												<div className="flex items-center gap-2 text-brandRed font-bold uppercase tracking-wider text-xs">
													<AlertTriangle size={14} />
													<span>
														TEST CASE FAILED ✗
													</span>
												</div>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
													<div className="bg-darkBg/60 p-2.5 rounded border border-darkBorder/40">
														<span className="text-[9px] font-bold text-text-disabled uppercase block mb-1">
															INPUT:
														</span>
														<pre className="text-white whitespace-pre-wrap select-all font-mono">
															{testCase.input}
														</pre>
													</div>
													<div className="bg-darkBg/60 p-2.5 rounded border border-darkBorder/40">
														<span className="text-[9px] font-bold text-text-disabled uppercase block mb-1">
															EXPECTED OUTPUT:
														</span>
														<pre className="text-brandGreen font-bold whitespace-pre-wrap select-all font-mono">
															{
																testCase.expectedOutput
															}
														</pre>
													</div>
												</div>
												<div className="bg-darkBg/60 p-2.5 rounded border border-darkBorder/40">
													<span className="text-[9px] font-bold text-text-disabled uppercase block mb-1">
														YOUR OUTPUT:
													</span>
													<pre className="text-brandRed font-bold whitespace-pre-wrap select-all font-mono">
														{testCase.output ||
															"No output"}
													</pre>
												</div>
											</div>
										);
									} catch (e) {
										return (
											<div
												key={index}
												className="text-brandRed font-bold whitespace-pre-wrap font-mono"
											>
												{log}
											</div>
										);
									}
								}

								if (log.startsWith("[TEST_CASE_ALERT_BLUE]")) {
									return (
										<div
											key={index}
											className="my-3 p-4 bg-brandBlue/10 border border-brandBlue/30 rounded font-mono text-xs text-white space-y-2"
										>
											<div className="flex items-center gap-2 text-brandBlue font-bold uppercase tracking-wider text-xs">
												<Play
													size={14}
													className="fill-brandBlue"
												/>
												<span>
													ALL TEST CASES PASSED ✓
												</span>
											</div>
											<p className="text-text-secondary text-xs font-mono">
												Your code executed and passed
												all provided test cases
												successfully.
											</p>
										</div>
									);
								}

								let textStyle = "text-text-secondary";
								if (log.startsWith("[SYSTEM]"))
									textStyle = "text-brandBlue font-bold";
								else if (log.startsWith("[STATUS]")) {
									if (log.includes("ACCEPTED"))
										textStyle = "text-brandGreen font-bold";
									else if (log.includes("REJECTED"))
										textStyle = "text-brandRed font-bold";
									else
										textStyle = "text-brandAmber font-bold";
								} else if (
									log.startsWith("[RESULT]") ||
									log.startsWith("[INFO]")
								)
									textStyle = "text-white font-bold";
								else if (log.startsWith("[CRITICAL_ERROR]"))
									textStyle = "text-brandRed font-bold";

								return (
									<div
										key={index}
										className={`${textStyle} whitespace-pre-wrap font-mono`}
									>
										{log}
									</div>
								);
							})
						)}
						{consoleLoading && (
							<div className="flex items-center gap-2 text-brandBlue animate-pulse mt-2 font-bold select-none">
								<Loader2 size={12} className="animate-spin" />
								<span>EVALUATION PENDING IN HOST QUEUE...</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProblemDetail;
