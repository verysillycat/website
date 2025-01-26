"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import UserArea from './DiscordPresence';
import Weather from './Weather';

export default function Header() {
	const [hamburgerTriggered, setHamburgerTriggered] = useState(false);
	const { status } = useSocket();
	const [showUserArea, setShowUserArea] = useState(false);

	const statusColor = {
		online: "bg-green-500",
		dnd: "bg-red-500",
		idle: "bg-yellow-500",
		offline: "bg-gray-500",
	} as const;

	const statusClass = statusColor[status as keyof typeof statusColor] || "bg-gray-500";

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 640) {
				setHamburgerTriggered(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		document.documentElement.style.scrollBehavior = 'xsmooth';

		return () => {
			document.documentElement.style.scrollBehavior = 'auto';
		};
	}, []);

	return (
		<div>
			<div className="h-20" />

			<AnimatePresence>
				{hamburgerTriggered && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						onClick={() => setHamburgerTriggered(false)}
					></motion.div>
				)}
			</AnimatePresence>

			<motion.div
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ type: "spring", stiffness: 150, damping: 20 }}
				className="fixed top-0 left-0 right-0 mx-20 mt-4 bg-dark/70 text-white border border-[#898c91] backdrop-blur-lg opacity-75 rounded-2xl shadow-md shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-shadow duration-300 non-selectable relative z-50"
				style={{ position: "fixed", top: 0, left: 0, right: 0 }}
			>
				<div className="p-3.5 non-selectable">
					<div className="flex justify-between items-center non-selectable">
						<div className="flex items-center gap-2 non-selectable min-w-fit xsm:w-1/4">
							<h1
								className="text-xl font-bold text-white/90 hover:text-shadow-[0_0_10px_rgba(22,22,22,15)] transition-all duration-300 non-selectable cursor-pointer"
								onClick={() => setShowUserArea(!showUserArea)}
							>
								Cortex
							</h1>
							<div
								className={`w-2 h-2 rounded-full ${statusClass} non-selectable`}
							></div>
						</div>

						<div className="flex-grow flex justify-center xxsm:w-2/4">
							<div className="pl-4 xsm:pl-0 xsm:mx-auto w-full flex justify-center">
								<Weather />
							</div>
						</div>

						<div className="flex items-center w-1/4 justify-end">
							<button
								className="xsm:hidden flex items-center justify-center non-selectable"
								onClick={() => setHamburgerTriggered(!hamburgerTriggered)}
								aria-label="Toggle menu"
							>
								<div className="relative w-8 h-8 flex items-center justify-center">
									<motion.span
										className="absolute w-6 h-0.5 bg-white rounded-full"
										initial={false}
										animate={{
											rotate: hamburgerTriggered ? 45 : 0,
											y: hamburgerTriggered ? 0 : -8,
											width: hamburgerTriggered ? "20px" : "25px",
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute w-6 h-0.5 bg-white rounded-full"
										initial={false}
										animate={{
											opacity: hamburgerTriggered ? 0 : 1,
											scale: hamburgerTriggered ? 0 : 1,
										}}
										transition={{ duration: 0.1, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute w-6 h-0.5 bg-white rounded-full"
										initial={false}
										animate={{
											rotate: hamburgerTriggered ? -45 : 0,
											y: hamburgerTriggered ? 0 : 8,
											width: hamburgerTriggered ? "20px" : "24px",
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute w-0.5 h-5 bg-white rounded-full"
										initial={false}
										animate={{
											opacity: hamburgerTriggered ? 1 : 0,
											scale: hamburgerTriggered ? 1 : 0,
											height: "20px",
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
									<motion.span
										className="absolute w-5 h-0.5 bg-white rounded-full"
										initial={false}
										animate={{
											opacity: hamburgerTriggered ? 1 : 0,
											scale: hamburgerTriggered ? 1 : 0,
											width: "20px",
										}}
										transition={{ duration: 0.2, ease: "easeInOut" }}
									/>
								</div>
							</button>
							<nav className="hidden xsm:flex gap-4 items-center non-selectable">
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										window.scrollTo({ top: 0 });
										setHamburgerTriggered(false);
									}}
									className="nav-link text-white/80 hover:text-white transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
								>
									Home
								</a>
								<a
									href="https://github.com/verysillycat/website"
									onClick={() => setHamburgerTriggered(false)}
									className="nav-link text-white/80 hover:text-white transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
									target="_blank"
									rel="noopener noreferrer"
								>
									Source
								</a>
								<a
									href="mailto:me@cortex.rest"
									onClick={() => setHamburgerTriggered(false)}
									className="nav-link text-white/80 hover:text-white transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
								>
									<svg 
										className="w-5 h-5"
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path 
											strokeLinecap="round" 
											strokeLinejoin="round" 
											strokeWidth="2" 
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</a>
							</nav>
						</div>
					</div>

					{hamburgerTriggered && (
						<div
							className="absolute left-0 right-0 mt-6 mx-4 bg-dark/70 text-white border border-[#898c91] opacity-75 rounded-2xl shadow-md shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 xsm:hidden non-selectable z-30"
							style={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.05)" }}
						>
							<nav className="index-nav xsm:hidden p-4 non-selectable">
								<div className="flex flex-col non-selectable">
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											window.scrollTo({ top: 0 });
											setHamburgerTriggered(false);
										}}
										className="hamburger-navlink text-white/80 hover:text-white py-2 hover:bg-white/10 transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
									>
										Home
									</a>
									<a
										href="https://github.com/verysillycat/website"
										className="hamburger-navlink text-white/80 hover:text-white py-2 hover:bg-white/10 transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
										target="_blank"
										rel="noopener noreferrer"
									>
										Source
									</a>
									<a
										href="mailto:me@cortex.rest"
										className="hamburger-navlink text-white/80 hover:text-white py-2 hover:bg-white/10 transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
									>
										<div className="flex items-center">
											<svg 
												className="w-5 h-5 mr-2"
												fill="none" 
												stroke="currentColor" 
												viewBox="0 0 24 24"
											>
												<path 
													strokeLinecap="round" 
													strokeLinejoin="round" 
													strokeWidth="2" 
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											Contact
										</div>
									</a>
								</div>
							</nav>
						</div>
					)}
				</div>
			</motion.div>

			<UserArea isOpen={showUserArea} onClose={() => setShowUserArea(false)} />
		</div>
	);
}
