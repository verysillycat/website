"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/socket";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
	const [hamburgerTriggered, setHamburgerTriggered] = useState(false);
	const { status } = useSocket();

	const statusColor =
		{
			online: "bg-green-500",
			dnd: "bg-red-500",
			idle: "bg-yellow-500",
			offline: "bg-gray-500",
		}[status] || "bg-gray-500";

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
		// Enable smooth scrolling for the entire page
		document.documentElement.style.scrollBehavior = 'smooth';

		return () => {
			document.documentElement.style.scrollBehavior = 'auto';
		};
	}, []);

	return (
		<>
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
				className="fixed top-0 left-0 right-0 mx-10 mt-4 bg-dark/70 text-white border border-[#898c91] backdrop-blur-lg opacity-75 rounded-2xl shadow-md shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-shadow duration-300 non-selectable relative z-50"
				style={{ position: "fixed", top: 0, left: 0, right: 0 }}
			>
				<div className="p-3.5 non-selectable">
					<div className="flex justify-between items-center non-selectable">
						<div className="flex items-center gap-2 non-selectable">
							<h1 className="text-xl font-bold text-white/90 text-shadow-[0_0_15px_rgba(255,255,255,1)] hover:text-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-300 non-selectable">
								Cortex
							</h1>
							<div
								className={`w-2 h-2 rounded-full ${statusColor} non-selectable`}
							></div>
						</div>
						<button
							className="sm:hidden flex items-center justify-center non-selectable"
							onClick={() => setHamburgerTriggered(!hamburgerTriggered)}
							aria-label="Toggle menu"
						>
							<svg
								className={`w-8 h-8 hamburger-icon ${hamburgerTriggered ? "open" : ""} non-selectable`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								{!hamburgerTriggered ? (
									<>
										<path
											className="hamburger-line top non-selectable"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 6h16"
										/>
										<path
											className="hamburger-line middle non-selectable"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 12h16"
										/>
										<path
											className="hamburger-line bottom non-selectable"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M4 18h16"
										/>
									</>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
									/>
								)}
							</svg>
						</button>
						<nav className="hidden sm:flex gap-4 items-center non-selectable">
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
								href="#about"
								onClick={() => setHamburgerTriggered(false)}
								className="nav-link text-white/80 hover:text-white transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
							>
								About
							</a>
							<a
								href="#contact"
								onClick={() => setHamburgerTriggered(false)}
								className="nav-link text-white/80 hover:text-white transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
							>
								Contact
							</a>
						</nav>
					</div>

					{hamburgerTriggered && (
						<div
							className="absolute left-0 right-0 mt-6 mx-4 bg-dark/70 text-white border border-[#898c91] opacity-75 rounded-2xl shadow-md shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-300 sm:hidden non-selectable z-30"
							style={{ boxShadow: "0 0 15px rgba(255, 255, 255, 0.05)" }}
						>
							<nav className="index-nav sm:hidden p-4 non-selectable">
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
										href="#about"
										className="hamburger-navlink text-white/80 hover:text-white py-2 hover:bg-white/10 transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
									>
										About
									</a>
									<a
										href="#contact"
										className="hamburger-navlink text-white/80 hover:text-white py-2 hover:bg-white/10 transition-all duration-300 hover:text-shadow-[0_0_12px_rgba(255,255,255,0.7)] non-selectable"
									>
										Contact
									</a>
								</div>
							</nav>
						</div>
					)}
				</div>
			</motion.div>
		</>
	);
}
